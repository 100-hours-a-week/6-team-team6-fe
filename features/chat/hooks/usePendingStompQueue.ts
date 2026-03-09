import { type RefObject, useCallback, useEffect, useRef } from "react";

import type { Client } from "@stomp/stompjs";
import { toast } from "sonner";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import {
	clearChatPendingMessages,
	readChatPendingMessages,
	writeChatPendingMessages,
} from "@/features/chat/lib/pending-storage";
import { buildStompJsonHeaders } from "@/features/chat/lib/stomp";

type UsePendingStompQueueParams = {
	authHeader: string | null;
	chatroomId: number | null;
	userId: number | null;
	stompClientRef: RefObject<Client | null>;
	isStompConnectedRef: RefObject<boolean>;
	myMembershipIdRef: RefObject<number | null>;
};

type UsePendingStompQueueResult = {
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	flushPendingMessages: () => void;
	handleOwnMessageAck: (clientMessageId: string | null | undefined, messageContent: string) => void;
};

type PublishContext = {
	client: Client;
	membershipId: number;
};

type StompBodyFactory = (membershipId: number) => Record<string, unknown>;

type PendingQueueItem = {
	clientMessageId: string;
	text: string;
};

type InFlightMessage = {
	text: string;
	timeoutId: ReturnType<typeof setTimeout>;
};

const ACK_TIMEOUT_MS = 8_000;
const ACK_TIMEOUT_ERROR_MESSAGE = "메시지 전송에 실패했습니다. 네트워크 상태를 확인해 주세요.";

function createClientMessageId() {
	return crypto.randomUUID();
}

export function usePendingStompQueue(
	params: UsePendingStompQueueParams,
): UsePendingStompQueueResult {
	const { authHeader, chatroomId, userId, stompClientRef, isStompConnectedRef, myMembershipIdRef } =
		params;

	const pendingMessagesRef = useRef<PendingQueueItem[]>([]);
	const inFlightMessageMapRef = useRef<Map<string, InFlightMessage>>(new Map());

	const syncPendingStorage = useCallback(() => {
		if (userId === null || chatroomId === null) {
			return;
		}

		const pendingMap = new Map<string, PendingQueueItem>();
		for (const pendingMessage of pendingMessagesRef.current) {
			pendingMap.set(pendingMessage.clientMessageId, pendingMessage);
		}
		for (const [clientMessageId, inFlightMessage] of inFlightMessageMapRef.current.entries()) {
			pendingMap.set(clientMessageId, {
				clientMessageId,
				text: inFlightMessage.text,
			});
		}

		writeChatPendingMessages({ userId, chatroomId }, [...pendingMap.values()]);
	}, [chatroomId, userId]);

	const clearInFlightMessage = useCallback((clientMessageId: string) => {
		const inFlightMessage = inFlightMessageMapRef.current.get(clientMessageId);
		if (!inFlightMessage) {
			return;
		}

		clearTimeout(inFlightMessage.timeoutId);
		inFlightMessageMapRef.current.delete(clientMessageId);
		syncPendingStorage();
	}, [syncPendingStorage]);

	const clearAllInFlightMessages = useCallback(() => {
		for (const inFlightMessage of inFlightMessageMapRef.current.values()) {
			clearTimeout(inFlightMessage.timeoutId);
		}
		inFlightMessageMapRef.current = new Map();
	}, []);

	const registerInFlightMessage = useCallback(
		(message: PendingQueueItem) => {
			clearInFlightMessage(message.clientMessageId);
			const timeoutId = setTimeout(() => {
				inFlightMessageMapRef.current.delete(message.clientMessageId);
				toast.error(ACK_TIMEOUT_ERROR_MESSAGE);
				syncPendingStorage();
			}, ACK_TIMEOUT_MS);

			inFlightMessageMapRef.current.set(message.clientMessageId, {
				text: message.text,
				timeoutId,
			});
			syncPendingStorage();
		},
		[clearInFlightMessage, syncPendingStorage],
	);

	useEffect(() => {
		pendingMessagesRef.current = [];
		clearAllInFlightMessages();

		if (userId !== null && chatroomId !== null) {
			pendingMessagesRef.current = readChatPendingMessages({ userId, chatroomId });
		}

		return () => {
			clearAllInFlightMessages();
		};
	}, [chatroomId, clearAllInFlightMessages, userId]);

	useEffect(() => {
		if (userId === null || chatroomId === null) {
			return;
		}

		if (pendingMessagesRef.current.length === 0 && inFlightMessageMapRef.current.size === 0) {
			clearChatPendingMessages({ userId, chatroomId });
			return;
		}

		syncPendingStorage();
	}, [chatroomId, syncPendingStorage, userId]);

	const getPublishContext = useCallback((): PublishContext | null => {
		const client = stompClientRef.current;
		const membershipId = myMembershipIdRef.current;
		if (!client || !client.connected || !isStompConnectedRef.current || membershipId === null) {
			return null;
		}

		return { client, membershipId };
	}, [isStompConnectedRef, myMembershipIdRef, stompClientRef]);

	const enqueuePendingMessage = useCallback((message: PendingQueueItem) => {
		pendingMessagesRef.current = [...pendingMessagesRef.current, message];
		syncPendingStorage();
	}, [syncPendingStorage]);

	const publishWithMembership = useCallback(
		(destination: string, buildBody: StompBodyFactory) => {
			if (!authHeader || chatroomId === null) {
				return false;
			}

			const publishContext = getPublishContext();
			if (!publishContext) {
				return false;
			}

			publishContext.client.publish({
				destination,
				headers: buildStompJsonHeaders(authHeader),
				body: JSON.stringify(buildBody(publishContext.membershipId)),
			});

			return true;
		},
		[authHeader, chatroomId, getPublishContext],
	);

	const publishMessage = useCallback(
		(message: PendingQueueItem) => {
			return publishWithMembership(STOMP_DESTINATION.send, (membershipId) => ({
				chatroomId,
				message: message.text,
				membershipId,
				clientMessageId: message.clientMessageId,
			}));
		},
		[chatroomId, publishWithMembership],
	);

	const flushPendingMessages = useCallback(() => {
		const pendingMessages = pendingMessagesRef.current;
		if (pendingMessages.length === 0) {
			return;
		}

		pendingMessagesRef.current = [];
		for (const [index, pendingMessage] of pendingMessages.entries()) {
			const isPublished = publishMessage(pendingMessage);
			if (!isPublished) {
				pendingMessagesRef.current = pendingMessages.slice(index);
				syncPendingStorage();
				break;
			}

			registerInFlightMessage(pendingMessage);
		}
	}, [publishMessage, registerInFlightMessage, syncPendingStorage]);

	const submitMessageByStomp = useCallback(
		(text: string) => {
			const pendingMessage: PendingQueueItem = {
				clientMessageId: createClientMessageId(),
				text,
			};
			const isPublished = publishMessage(pendingMessage);
			if (!isPublished) {
				enqueuePendingMessage(pendingMessage);
				return;
			}

			registerInFlightMessage(pendingMessage);
		},
		[enqueuePendingMessage, publishMessage, registerInFlightMessage],
	);

	const handleOwnMessageAck = useCallback(
		(clientMessageId: string | null | undefined, messageContent: string) => {
			if (clientMessageId && inFlightMessageMapRef.current.has(clientMessageId)) {
				clearInFlightMessage(clientMessageId);
				return;
			}

			for (const [id, inFlightMessage] of inFlightMessageMapRef.current.entries()) {
				if (inFlightMessage.text === messageContent) {
					clearInFlightMessage(id);
					return;
				}
			}
		},
		[clearInFlightMessage],
	);

	const markAsReadByStomp = useCallback(
		(readMessageId: string) => {
			void publishWithMembership(STOMP_DESTINATION.read, (membershipId) => ({
				chatroomId,
				membershipId,
				readMessageId,
			}));
		},
		[chatroomId, publishWithMembership],
	);

	return {
		submitMessageByStomp,
		markAsReadByStomp,
		flushPendingMessages,
		handleOwnMessageAck,
	};
}
