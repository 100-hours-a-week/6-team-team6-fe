import { type Dispatch, type MutableRefObject, type SetStateAction,useEffect } from "react";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
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
	messageContent: string;
	createdAt: string;
};

export type UseStompConnectionLifecycleParams = {
	authHeader: string | null;
	chatroomId: number | null;
	myUserId: number | null;
	wsEndpoint: string | null;
	stompClientRef: MutableRefObject<Client | null>;
	isStompConnectedRef: MutableRefObject<boolean>;
	isAwaitingJoinAckRef: MutableRefObject<boolean>;
	myMembershipIdRef: MutableRefObject<number | null>;
	realtimeChatroomIdRef: MutableRefObject<number | null>;
	setRealtimeChatroomId: Dispatch<SetStateAction<number | null>>;
	setRealtimeMessages: Dispatch<SetStateAction<ChatMessages>>;
	flushPendingMessages: () => void;
};

function parseStompBody(message: IMessage): unknown {
	try {
		return JSON.parse(message.body);
	} catch {
		return null;
	}
}

function parseNumberValue(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

function parseChatJoinPayload(payload: unknown): ChatJoinPayload | null {
	if (typeof payload !== "object" || payload === null) {
		return null;
	}

	const data = payload as Record<string, unknown>;
	if (
		typeof data.messageContent === "string" ||
		typeof data.messageId === "string" ||
		typeof data.createdAt === "string"
	) {
		return null;
	}
	const chatroomId = parseNumberValue(data.chatroomId);
	const userId = parseNumberValue(data.userId);
	const membershipId = parseNumberValue(data.membershipId);

	if (chatroomId === null || membershipId === null) {
		return null;
	}

	return { chatroomId, userId, membershipId };
}

function parseChatMessagePayload(payload: unknown): ChatMessagePayload | null {
	if (typeof payload !== "object" || payload === null) {
		return null;
	}

	const data = payload as Record<string, unknown>;
	const chatroomId = parseNumberValue(data.chatroomId);
	const membershipId = parseNumberValue(data.membershipId);
	const messageId = typeof data.messageId === "string" ? data.messageId : null;
	const messageContent = typeof data.messageContent === "string" ? data.messageContent : null;
	const createdAt = typeof data.createdAt === "string" ? data.createdAt : null;

	if (
		chatroomId === null ||
		membershipId === null ||
		messageId === null ||
		messageContent === null ||
		createdAt === null
	) {
		return null;
	}

	return { chatroomId, membershipId, messageId, messageContent, createdAt };
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
	} = params;

	useEffect(() => {
		if (!authHeader || chatroomId === null || !wsEndpoint) {
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
			if (!messagePayload || messagePayload.chatroomId !== chatroomId) {
				const joinPayload = parseChatJoinPayload(payload);
				if (joinPayload && joinPayload.chatroomId === chatroomId) {
					const isMyJoinPayload =
						(joinPayload.userId !== null && myUserId !== null && joinPayload.userId === myUserId) ||
						(joinPayload.userId === null && isAwaitingJoinAckRef.current);

					if (isMyJoinPayload) {
						myMembershipIdRef.current = joinPayload.membershipId;
						isAwaitingJoinAckRef.current = false;
						flushPendingMessages();
					}
				}
				return;
			}

			if (
				myMembershipIdRef.current !== null &&
				messagePayload.membershipId === myMembershipIdRef.current
			) {
				return;
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
					who: "partner",
					message: messagePayload.messageContent,
					createdAt: messagePayload.createdAt,
				};

				return [nextMessage, ...baseMessages];
			});
		};

		client.beforeConnect = (stompClient) => {
			stompClient.connectHeaders = {
				Authorization: authHeader,
			};
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
					Authorization: authHeader,
				},
			);

			client.publish({
				destination: STOMP_DESTINATION.join,
				headers: {
					Authorization: authHeader,
					"content-type": "application/json",
				},
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
				subscription.unsubscribe({
					Authorization: authHeader,
				});
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
	]);
}
