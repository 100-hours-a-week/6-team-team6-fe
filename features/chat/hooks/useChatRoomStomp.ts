import { useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "next/navigation";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

import { usePendingStompQueue } from "@/features/chat/hooks/usePendingStompQueue";
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

interface UseChatRoomStompProps {
	messages: ChatMessages;
	submitMessage: (text: string) => void;
}

interface UseChatRoomStompResult {
	mergedMessages: ChatMessages;
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
}

function buildWebSocketEndpoint(apiUrl: string | undefined) {
	if (!apiUrl) {
		return null;
	}

	try {
		const parsed = new URL(apiUrl);
		const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
		return `${protocol}//${parsed.host}/ws`;
	} catch {
		return null;
	}
}

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

function getMessageKey(message: ChatMessage) {
	return message.messageId ?? `${message.who}:${message.createdAt}:${message.message}`;
}

function mergeMessages(
	historyMessages: ChatMessages,
	realtimeMessages: ChatMessages,
): ChatMessages {
	const merged: ChatMessages = [];
	const seen = new Set<string>();

	for (const message of [...realtimeMessages, ...historyMessages]) {
		const key = getMessageKey(message);
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		merged.push(message);
	}

	return merged.sort((left, right) => {
		const leftTime = Date.parse(left.createdAt);
		const rightTime = Date.parse(right.createdAt);

		if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
			const leftId = left.messageId ?? "";
			const rightId = right.messageId ?? "";
			return rightId.localeCompare(leftId);
		}

		if (rightTime !== leftTime) {
			return rightTime - leftTime;
		}

		const leftId = left.messageId ?? "";
		const rightId = right.messageId ?? "";
		return rightId.localeCompare(leftId);
	});
}

export function useChatRoomStomp(props: UseChatRoomStompProps): UseChatRoomStompResult {
	const { messages, submitMessage } = props;
	const params = useParams<{ chatRoomId?: string }>();
	const { data: session } = useSession();

	const [realtimeChatroomId, setRealtimeChatroomId] = useState<number | null>(null);
	const [realtimeMessages, setRealtimeMessages] = useState<ChatMessages>([]);
	const stompClientRef = useRef<Client | null>(null);
	const subscriptionRef = useRef<StompSubscription | null>(null);
	const isAwaitingJoinAckRef = useRef(false);
	const myMembershipIdRef = useRef<number | null>(null);
	const realtimeChatroomIdRef = useRef<number | null>(null);
	const isStompConnectedRef = useRef(false);

	const chatroomId = useMemo(() => {
		const raw = params?.chatRoomId;
		if (!raw) {
			return null;
		}
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? null : parsed;
	}, [params]);
	const myUserId = useMemo(() => {
		const raw = session?.user?.id;
		if (!raw) {
			return null;
		}
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? null : parsed;
	}, [session?.user?.id]);
	const accessToken = session?.accessToken ?? null;
	const authHeader = useMemo(() => {
		if (!accessToken) {
			return null;
		}
		return `Bearer ${accessToken}`;
	}, [accessToken]);
	const wsEndpoint = useMemo(() => {
		return buildWebSocketEndpoint(process.env.NEXT_PUBLIC_API_URL);
	}, []);

	const mergedMessages = useMemo(() => {
		if (chatroomId === null || realtimeChatroomId !== chatroomId) {
			return mergeMessages(messages, []);
		}
		return mergeMessages(messages, realtimeMessages);
	}, [chatroomId, messages, realtimeChatroomId, realtimeMessages]);

	const { submitMessageByStomp, markAsReadByStomp, flushPendingMessages } =
		usePendingStompQueue({
			authHeader,
			chatroomId,
			submitMessage,
			stompClientRef,
			isStompConnectedRef,
			myMembershipIdRef,
		});

	useEffect(() => {
		if (!authHeader || chatroomId === null || !wsEndpoint) {
			return;
		}

		// TODO: 상수화
		const client = new Client({
			brokerURL: wsEndpoint,
			reconnectDelay: 5000,
			heartbeatIncoming: 10000,
			heartbeatOutgoing: 10000,
			connectionTimeout: 10000,
		});
		const subscriptionId = `chatroom-sub-${chatroomId}-${Date.now()}`;
		stompClientRef.current = client;
		subscriptionRef.current = null;
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

			subscriptionRef.current = client.subscribe(
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
			if (subscriptionRef.current) {
				subscriptionRef.current.unsubscribe({
					Authorization: authHeader,
				});
			}
			subscriptionRef.current = null;

			isStompConnectedRef.current = false;
			myMembershipIdRef.current = null;
			isAwaitingJoinAckRef.current = false;
			void client.deactivate();
			if (stompClientRef.current === client) {
				stompClientRef.current = null;
			}
		};
	}, [authHeader, chatroomId, flushPendingMessages, myUserId, wsEndpoint]);

	return {
		mergedMessages,
		submitMessageByStomp,
		markAsReadByStomp,
	};
}
