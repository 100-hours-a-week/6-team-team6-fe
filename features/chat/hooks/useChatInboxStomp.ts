"use client";

import { useEffect, useMemo } from "react";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import { buildWebSocketEndpoint } from "@/features/chat/lib/stomp";
import { ChatSendAckResponseSchema } from "@/features/chat/schemas";

function parseStompBody(message: IMessage): unknown {
	try {
		return JSON.parse(message.body);
	} catch {
		return null;
	}
}

function isChatRoomListQueryKey(queryKey: readonly unknown[]) {
	return queryKey[0] === "chatrooms" && (queryKey[1] === "all" || queryKey[1] === "item");
}

export function useChatInboxStomp() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
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

	useEffect(() => {
		if (!authHeader || !wsEndpoint) {
			return;
		}

		//
		const client = new Client({
			brokerURL: wsEndpoint,
			reconnectDelay: 5000,
			heartbeatIncoming: 10000,
			heartbeatOutgoing: 10000,
			connectionTimeout: 10000,
		});
		const subscriptionId = `chat-inbox-sub-${Date.now()}`;
		let subscription: StompSubscription | null = null;

		const handleInboxMessage = (frame: IMessage) => {
			const payload = parseStompBody(frame);
			const parsed = ChatSendAckResponseSchema.safeParse(payload);
			if (!parsed.success) {
				return;
			}

			queryClient.invalidateQueries({
				predicate: (query) => {
					const queryKey = query.queryKey;
					if (!Array.isArray(queryKey)) {
						return false;
					}
					return isChatRoomListQueryKey(queryKey);
				},
			});
			queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
		};

		client.beforeConnect = (stompClient) => {
			stompClient.connectHeaders = {
				Authorization: authHeader,
			};
		};

		client.onConnect = () => {
			subscription = client.subscribe(STOMP_DESTINATION.chatInbox, handleInboxMessage, {
				id: subscriptionId,
				ack: "auto",
				Authorization: authHeader,
			});
		};

		client.activate();

		return () => {
			if (subscription) {
				subscription.unsubscribe({
					Authorization: authHeader,
				});
			}

			void client.deactivate();
		};
	}, [authHeader, queryClient, wsEndpoint]);
}
