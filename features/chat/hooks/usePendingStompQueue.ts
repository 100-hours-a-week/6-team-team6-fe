import { type RefObject, useCallback, useEffect, useRef } from "react";

import type { Client } from "@stomp/stompjs";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import { buildStompJsonHeaders } from "@/features/chat/lib/stomp";

type UsePendingStompQueueParams = {
	authHeader: string | null;
	chatroomId: number | null;
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

function createClientMessageId() {
	return crypto.randomUUID();
}

export function usePendingStompQueue(
	params: UsePendingStompQueueParams,
): UsePendingStompQueueResult {
	const { authHeader, chatroomId, stompClientRef, isStompConnectedRef, myMembershipIdRef } =
		params;

	const pendingMessagesRef = useRef<PendingQueueItem[]>([]);
	const inFlightMessageMapRef = useRef<Map<string, string>>(new Map());

	useEffect(() => {
		pendingMessagesRef.current = [];
		inFlightMessageMapRef.current = new Map();
	}, [chatroomId]);

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
	}, []);

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
				break;
			}

			inFlightMessageMapRef.current.set(pendingMessage.clientMessageId, pendingMessage.text);
		}
	}, [publishMessage]);

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

			inFlightMessageMapRef.current.set(pendingMessage.clientMessageId, pendingMessage.text);
		},
		[enqueuePendingMessage, publishMessage],
	);

	const handleOwnMessageAck = useCallback(
		(clientMessageId: string | null | undefined, messageContent: string) => {
			if (clientMessageId && inFlightMessageMapRef.current.has(clientMessageId)) {
				inFlightMessageMapRef.current.delete(clientMessageId);
				return;
			}

			for (const [id, text] of inFlightMessageMapRef.current.entries()) {
				if (text === messageContent) {
					inFlightMessageMapRef.current.delete(id);
					return;
				}
			}
		},
		[],
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
