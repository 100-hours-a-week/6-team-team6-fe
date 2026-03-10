import { type Dispatch, type RefObject, type SetStateAction, useEffect } from "react";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { z } from "zod";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import { buildStompAuthHeaders, buildStompJsonHeaders } from "@/features/chat/lib/stomp";
import type { ChatMessage, ChatMessages } from "@/features/chat/lib/types";

type ChatJoinPayload = {
	chatroomId: number;
	userId: number | null;
	membershipId: number;
};

type ChatMessagePayload = {
	chatroomId: number;
	membershipId: number;
	messageId: string;
	clientMessageId?: string | null;
	messageContent: string;
	createdAt: string;
};

export type UseStompConnectionLifecycleParams = {
	authHeader: string | null;
	chatroomId: string;
	myUserId: number;
	wsEndpoint: string | null;
	stompClientRef: RefObject<Client | null>;
	isStompConnectedRef: RefObject<boolean>;
	isAwaitingJoinAckRef: RefObject<boolean>;
	myMembershipIdRef: RefObject<number | null>;
	realtimeChatroomIdRef: RefObject<string | null>;
	setRealtimeChatroomId: Dispatch<SetStateAction<string | null>>;
	setRealtimeMessages: Dispatch<SetStateAction<ChatMessages>>;
	flushPendingMessages: () => void;
	onOwnMessageAck: (
		clientMessageId: string | null | undefined,
		messageContent: string,
	) => void;
};

const StompChatJoinPayloadSchema = z.object({
	chatroomId: z.coerce.number(),
	userId: z.union([z.coerce.number(), z.null()]).optional().transform((value) => value ?? null),
	membershipId: z.coerce.number(),
	messageContent: z.never().optional(),
	messageId: z.never().optional(),
	createdAt: z.never().optional(),
});

const StompChatMessagePayloadSchema = z.object({
	chatroomId: z.coerce.number(),
	membershipId: z.coerce.number(),
	messageId: z.string(),
	clientMessageId: z.string().nullable().optional(),
	messageContent: z.string(),
	createdAt: z.string(),
});

function parseStompBody(message: IMessage): unknown {
	try {
		return JSON.parse(message.body);
	} catch {
		return null;
	}
}

function parseChatJoinPayload(payload: unknown): ChatJoinPayload | null {
	const parsed = StompChatJoinPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return null;
	}

	return parsed.data;
}

function parseChatMessagePayload(payload: unknown): ChatMessagePayload | null {
	const parsed = StompChatMessagePayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return null;
	}

	return parsed.data;
}

export function useStompConnectionLifecycle(params: UseStompConnectionLifecycleParams): void {
	const {
		authHeader,
		chatroomId,
		myUserId,
		wsEndpoint,
		stompClientRef,
		isStompConnectedRef,
		isAwaitingJoinAckRef,
		myMembershipIdRef,
		realtimeChatroomIdRef,
		setRealtimeChatroomId,
		setRealtimeMessages,
		flushPendingMessages,
		onOwnMessageAck,
	} = params;

	useEffect(() => {
		if (!authHeader || !wsEndpoint) {
			return;
		}

		const client = new Client({
			brokerURL: wsEndpoint,
			reconnectDelay: 5000,
			heartbeatIncoming: 10000,
			heartbeatOutgoing: 10000,
			connectionTimeout: 10000,
		});
		const subscriptionId = `chatroom-sub-${chatroomId}-${Date.now()}`;
		let subscription: StompSubscription | null = null;

		stompClientRef.current = client;
		isAwaitingJoinAckRef.current = false;
		isStompConnectedRef.current = false;

		const handleIncomingMessage = (frame: IMessage) => {
			const payload = parseStompBody(frame);

			const messagePayload = parseChatMessagePayload(payload);
			if (!messagePayload || String(messagePayload.chatroomId) !== chatroomId) {
				const joinPayload = parseChatJoinPayload(payload);
				if (joinPayload && String(joinPayload.chatroomId) === chatroomId) {
					const isMyJoinPayload =
						(joinPayload.userId !== null && joinPayload.userId === myUserId) ||
						(joinPayload.userId === null && isAwaitingJoinAckRef.current);

					if (isMyJoinPayload) {
						myMembershipIdRef.current = joinPayload.membershipId;
						isAwaitingJoinAckRef.current = false;
						flushPendingMessages();
					}
				}
				return;
			}

			const isOwnMessage =
				myMembershipIdRef.current !== null &&
				messagePayload.membershipId === myMembershipIdRef.current;
			if (isOwnMessage) {
				onOwnMessageAck(messagePayload.clientMessageId, messagePayload.messageContent);
			}

			const shouldReuseRealtimeMessages = realtimeChatroomIdRef.current === chatroomId;
			realtimeChatroomIdRef.current = chatroomId;
			setRealtimeChatroomId(chatroomId);
			setRealtimeMessages((prev) => {
				const baseMessages = shouldReuseRealtimeMessages ? prev : [];

				if (baseMessages.some((message) => message.messageId === messagePayload.messageId)) {
					return baseMessages;
				}

				const nextMessage: ChatMessage = {
					messageId: messagePayload.messageId,
					clientMessageId: messagePayload.clientMessageId,
					who: isOwnMessage ? "me" : "partner",
					message: messagePayload.messageContent,
					createdAt: messagePayload.createdAt,
				};

				return [nextMessage, ...baseMessages];
			});
		};

		client.beforeConnect = (stompClient) => {
			stompClient.connectHeaders = buildStompAuthHeaders(authHeader);
		};

		client.onConnect = () => {
			isStompConnectedRef.current = true;
			myMembershipIdRef.current = null;

			subscription = client.subscribe(
				STOMP_DESTINATION.subscribe(chatroomId),
				handleIncomingMessage,
				{
					id: subscriptionId,
					ack: "auto",
					...buildStompAuthHeaders(authHeader),
				},
			);

			client.publish({
				destination: STOMP_DESTINATION.join,
				headers: buildStompJsonHeaders(authHeader),
				body: JSON.stringify({ chatroomId }),
			});
			isAwaitingJoinAckRef.current = true;
		};

		client.onWebSocketClose = () => {
			isStompConnectedRef.current = false;
		};
		client.onStompError = () => {
			isStompConnectedRef.current = false;
		};

		client.activate();

		return () => {
			if (subscription) {
				subscription.unsubscribe(buildStompAuthHeaders(authHeader));
			}

			isStompConnectedRef.current = false;
			myMembershipIdRef.current = null;
			isAwaitingJoinAckRef.current = false;
			void client.deactivate();

			if (stompClientRef.current === client) {
				stompClientRef.current = null;
			}
		};
	}, [
		authHeader,
		chatroomId,
		flushPendingMessages,
		isAwaitingJoinAckRef,
		isStompConnectedRef,
		myMembershipIdRef,
		myUserId,
		realtimeChatroomIdRef,
		setRealtimeChatroomId,
		setRealtimeMessages,
		stompClientRef,
		wsEndpoint,
		onOwnMessageAck,
	]);
}
