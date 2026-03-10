import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import type { Client } from "@stomp/stompjs";
import { toast } from "sonner";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import {
	readChatPendingHeldMessages,
	readChatPendingMessages,
	writeChatPendingHeldMessages,
	writeChatPendingMessages,
} from "@/features/chat/lib/pending-storage";
import { buildStompJsonHeaders, parseStompChatroomId } from "@/features/chat/lib/stomp";

type UsePendingStompQueueParams = {
	authHeader: string | null;
	chatroomId: string;
	userId: number;
	stompClientRef: RefObject<Client | null>;
	isStompConnectedRef: RefObject<boolean>;
	myMembershipIdRef: RefObject<number | null>;
};

export type MessageDeliveryIssue = {
	clientMessageId: string;
	text: string;
	createdAt: string;
	status: "failed" | "held" | "in_flight";
};

type UsePendingStompQueueResult = {
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	flushPendingMessages: () => void;
	handleOwnMessageAck: (clientMessageId: string | null | undefined, messageContent: string) => void;
	retryHeldMessageByClientMessageId: (clientMessageId: string) => void;
	reconcileDeliveredClientMessageIds: (clientMessageIds: string[]) => void;
	messageDeliveryIssues: MessageDeliveryIssue[];
};

type PublishContext = {
	client: Client;
	membershipId: number;
};

type StompBodyFactory = (membershipId: number) => Record<string, unknown>;

type PendingQueueItem = {
	clientMessageId: string;
	text: string;
	createdAt: string;
};

type HeldReason = "timeout" | "deferred";

type HeldMessage = PendingQueueItem & {
	reason: HeldReason;
};

type InFlightMessage = {
	text: string;
	createdAt: string;
	timeoutId: ReturnType<typeof setTimeout>;
};

const ACK_TIMEOUT_MS = 8_000;
const ACK_TIMEOUT_ERROR_MESSAGE = "메시지 전송에 실패했습니다. 네트워크 상태를 확인해 주세요.";

function createClientMessageId() {
	return crypto.randomUUID();
}

function createMessageCreatedAt() {
	return new Date().toISOString();
}

function toPendingQueueItem(message: HeldMessage): PendingQueueItem {
	return {
		clientMessageId: message.clientMessageId,
		text: message.text,
		createdAt: message.createdAt,
	};
}

export function usePendingStompQueue(
	params: UsePendingStompQueueParams,
): UsePendingStompQueueResult {
	const { authHeader, chatroomId, userId, stompClientRef, isStompConnectedRef, myMembershipIdRef } =
		params;

	const pendingMessagesRef = useRef<PendingQueueItem[]>([]);
	const heldMessagesRef = useRef<HeldMessage[]>([]);
	const inFlightMessageMapRef = useRef<Map<string, InFlightMessage>>(new Map());
	const [messageDeliveryIssues, setMessageDeliveryIssues] = useState<MessageDeliveryIssue[]>([]);

	const syncDeliveryIssuesState = useCallback(() => {
		const issueMap = new Map<string, MessageDeliveryIssue>();

		for (const pendingMessage of pendingMessagesRef.current) {
			issueMap.set(pendingMessage.clientMessageId, {
				clientMessageId: pendingMessage.clientMessageId,
				text: pendingMessage.text,
				createdAt: pendingMessage.createdAt,
				status: "in_flight",
			});
		}

		for (const heldMessage of heldMessagesRef.current) {
			issueMap.set(heldMessage.clientMessageId, {
				clientMessageId: heldMessage.clientMessageId,
				text: heldMessage.text,
				createdAt: heldMessage.createdAt,
				status: heldMessage.reason === "timeout" ? "failed" : "held",
			});
		}

		for (const [clientMessageId, inFlightMessage] of inFlightMessageMapRef.current.entries()) {
			issueMap.set(clientMessageId, {
				clientMessageId,
				text: inFlightMessage.text,
				createdAt: inFlightMessage.createdAt,
				status: "in_flight",
			});
		}

		setMessageDeliveryIssues([...issueMap.values()]);
	}, []);

	const syncPendingStorage = useCallback(() => {
		writeChatPendingMessages({ userId, chatroomId }, pendingMessagesRef.current);
	}, [chatroomId, userId]);

	const syncHeldStorage = useCallback(() => {
		writeChatPendingHeldMessages(
			{ userId, chatroomId },
			heldMessagesRef.current.map(toPendingQueueItem),
		);
	}, [chatroomId, userId]);

	const removeHeldMessageByClientMessageId = useCallback(
		(clientMessageId: string) => {
			const previousLength = heldMessagesRef.current.length;
			heldMessagesRef.current = heldMessagesRef.current.filter(
				(heldMessage) => heldMessage.clientMessageId !== clientMessageId,
			);
			if (heldMessagesRef.current.length === previousLength) {
				return;
			}

			syncHeldStorage();
			syncDeliveryIssuesState();
		},
		[syncDeliveryIssuesState, syncHeldStorage],
	);

	const upsertHeldMessage = useCallback(
		(message: PendingQueueItem, reason: HeldReason) => {
			heldMessagesRef.current = [
				...heldMessagesRef.current.filter(
					(heldMessage) => heldMessage.clientMessageId !== message.clientMessageId,
				),
				{
					clientMessageId: message.clientMessageId,
					text: message.text,
					createdAt: message.createdAt,
					reason,
				},
			];

			syncHeldStorage();
			syncDeliveryIssuesState();
		},
		[syncDeliveryIssuesState, syncHeldStorage],
	);

	const clearInFlightMessage = useCallback(
		(clientMessageId: string) => {
			const inFlightMessage = inFlightMessageMapRef.current.get(clientMessageId);
			if (!inFlightMessage) {
				return;
			}

			clearTimeout(inFlightMessage.timeoutId);
			inFlightMessageMapRef.current.delete(clientMessageId);
			syncDeliveryIssuesState();
		},
		[syncDeliveryIssuesState],
	);

	const holdAllInFlightMessages = useCallback(
		(reason: HeldReason, shouldSyncState = true) => {
			if (inFlightMessageMapRef.current.size === 0) {
				return;
			}

			const heldMap = new Map(
				heldMessagesRef.current.map((heldMessage) => [heldMessage.clientMessageId, heldMessage]),
			);
			for (const [clientMessageId, inFlightMessage] of inFlightMessageMapRef.current.entries()) {
				clearTimeout(inFlightMessage.timeoutId);
				heldMap.set(clientMessageId, {
					clientMessageId,
					text: inFlightMessage.text,
					createdAt: inFlightMessage.createdAt,
					reason,
				});
			}

			heldMessagesRef.current = [...heldMap.values()];
			inFlightMessageMapRef.current = new Map();
			syncHeldStorage();
			if (shouldSyncState) {
				syncDeliveryIssuesState();
			}
		},
		[syncDeliveryIssuesState, syncHeldStorage],
	);

	const registerInFlightMessage = useCallback(
		(message: PendingQueueItem) => {
			clearInFlightMessage(message.clientMessageId);
			const timeoutId = setTimeout(() => {
				inFlightMessageMapRef.current.delete(message.clientMessageId);
				upsertHeldMessage(message, "timeout");
				toast.error(ACK_TIMEOUT_ERROR_MESSAGE);
			}, ACK_TIMEOUT_MS);

			inFlightMessageMapRef.current.set(message.clientMessageId, {
				text: message.text,
				createdAt: message.createdAt,
				timeoutId,
			});
			syncDeliveryIssuesState();
		},
		[clearInFlightMessage, syncDeliveryIssuesState, upsertHeldMessage],
	);

	useEffect(() => {
		pendingMessagesRef.current = [];
		heldMessagesRef.current = [];
		for (const inFlightMessage of inFlightMessageMapRef.current.values()) {
			clearTimeout(inFlightMessage.timeoutId);
		}
		inFlightMessageMapRef.current = new Map();

		pendingMessagesRef.current = readChatPendingMessages({ userId, chatroomId }).map((message) => ({
			...message,
			createdAt: message.createdAt ?? createMessageCreatedAt(),
		}));
		heldMessagesRef.current = readChatPendingHeldMessages({ userId, chatroomId }).map((message) => ({
			...message,
			createdAt: message.createdAt ?? createMessageCreatedAt(),
			reason: "deferred",
		}));
		const syncTimerId = setTimeout(() => {
			syncDeliveryIssuesState();
		}, 0);

		return () => {
			clearTimeout(syncTimerId);
			holdAllInFlightMessages("deferred", false);
		};
	}, [chatroomId, holdAllInFlightMessages, syncDeliveryIssuesState, userId]);

	const getPublishContext = useCallback((): PublishContext | null => {
		const client = stompClientRef.current;
		const membershipId = myMembershipIdRef.current;
		if (!client || !client.connected || !isStompConnectedRef.current || membershipId === null) {
			return null;
		}

		return { client, membershipId };
	}, [isStompConnectedRef, myMembershipIdRef, stompClientRef]);

	const enqueuePendingMessage = useCallback(
		(message: PendingQueueItem) => {
			if (
				pendingMessagesRef.current.some(
					(pendingMessage) => pendingMessage.clientMessageId === message.clientMessageId,
				)
			) {
				return;
			}
			pendingMessagesRef.current = [...pendingMessagesRef.current, message];
			syncPendingStorage();
			syncDeliveryIssuesState();
		},
		[syncDeliveryIssuesState, syncPendingStorage],
	);

	const publishWithMembership = useCallback(
		(destination: string, buildBody: StompBodyFactory) => {
			if (!authHeader) {
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
		[authHeader, getPublishContext],
	);

	const publishMessage = useCallback(
		(message: PendingQueueItem) => {
			const numericChatroomId = parseStompChatroomId(chatroomId);
			if (numericChatroomId === null) {
				return false;
			}

			return publishWithMembership(STOMP_DESTINATION.send, (membershipId) => ({
				chatroomId: numericChatroomId,
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
		syncPendingStorage();
		syncDeliveryIssuesState();
		for (const [index, pendingMessage] of pendingMessages.entries()) {
			const isPublished = publishMessage(pendingMessage);
			if (!isPublished) {
				pendingMessagesRef.current = pendingMessages.slice(index);
				syncPendingStorage();
				syncDeliveryIssuesState();
				break;
			}

			registerInFlightMessage(pendingMessage);
		}
	}, [publishMessage, registerInFlightMessage, syncDeliveryIssuesState, syncPendingStorage]);

	const submitMessageByStomp = useCallback(
		(text: string) => {
			const pendingMessage: PendingQueueItem = {
				clientMessageId: createClientMessageId(),
				text,
				createdAt: createMessageCreatedAt(),
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

	const retryHeldMessageByClientMessageId = useCallback(
		(clientMessageId: string) => {
			const heldMessage = heldMessagesRef.current.find(
				(message) => message.clientMessageId === clientMessageId,
			);
			if (!heldMessage) {
				return;
			}

			removeHeldMessageByClientMessageId(clientMessageId);

			const pendingMessage = toPendingQueueItem(heldMessage);
			const isPublished = publishMessage(pendingMessage);
			if (!isPublished) {
				enqueuePendingMessage(pendingMessage);
				return;
			}

			registerInFlightMessage(pendingMessage);
		},
		[enqueuePendingMessage, publishMessage, registerInFlightMessage, removeHeldMessageByClientMessageId],
	);

	const reconcileDeliveredClientMessageIds = useCallback(
		(clientMessageIds: string[]) => {
			const idSet = new Set(
				clientMessageIds.filter(
					(clientMessageId) => typeof clientMessageId === "string" && clientMessageId.length > 0,
				),
			);
			if (idSet.size === 0) {
				return;
			}

			let hasChanged = false;

			const nextPendingMessages = pendingMessagesRef.current.filter(
				(pendingMessage) => !idSet.has(pendingMessage.clientMessageId),
			);
			if (nextPendingMessages.length !== pendingMessagesRef.current.length) {
				pendingMessagesRef.current = nextPendingMessages;
				syncPendingStorage();
				hasChanged = true;
			}

			const nextHeldMessages = heldMessagesRef.current.filter(
				(heldMessage) => !idSet.has(heldMessage.clientMessageId),
			);
			if (nextHeldMessages.length !== heldMessagesRef.current.length) {
				heldMessagesRef.current = nextHeldMessages;
				syncHeldStorage();
				hasChanged = true;
			}

			for (const clientMessageId of idSet) {
				const inFlightMessage = inFlightMessageMapRef.current.get(clientMessageId);
				if (!inFlightMessage) {
					continue;
				}
				clearTimeout(inFlightMessage.timeoutId);
				inFlightMessageMapRef.current.delete(clientMessageId);
				hasChanged = true;
			}

			if (hasChanged) {
				syncDeliveryIssuesState();
			}
		},
		[syncDeliveryIssuesState, syncHeldStorage, syncPendingStorage],
	);

	const handleOwnMessageAck = useCallback(
		(clientMessageId: string | null | undefined, messageContent: string) => {
			if (typeof clientMessageId === "string" && clientMessageId.length > 0) {
				reconcileDeliveredClientMessageIds([clientMessageId]);
				return;
			}

			const matchedIds = [...inFlightMessageMapRef.current.entries()]
				.filter(([, inFlightMessage]) => inFlightMessage.text === messageContent)
				.map(([id]) => id);
			if (matchedIds.length === 1) {
				reconcileDeliveredClientMessageIds([matchedIds[0]]);
			}
		},
		[reconcileDeliveredClientMessageIds],
	);

	const markAsReadByStomp = useCallback(
		(readMessageId: string) => {
			const numericChatroomId = parseStompChatroomId(chatroomId);
			if (numericChatroomId === null) {
				return;
			}

			void publishWithMembership(STOMP_DESTINATION.read, (membershipId) => ({
				chatroomId: numericChatroomId,
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
		retryHeldMessageByClientMessageId,
		reconcileDeliveredClientMessageIds,
		messageDeliveryIssues,
	};
}
