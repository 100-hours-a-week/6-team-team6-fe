import { useEffect, useMemo, useRef } from "react";

import type { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

import { usePendingStompQueue } from "@/features/chat/hooks/usePendingStompQueue";
import { useRealtimeMessageMerge } from "@/features/chat/hooks/useRealtimeMessageMerge";
import { useStompConnectionLifecycle } from "@/features/chat/hooks/useStompConnectionLifecycle";
import { buildWebSocketEndpoint } from "@/features/chat/lib/stomp";
import type { ChatMessage, ChatMessages } from "@/features/chat/lib/types";

interface UseChatRoomStompProps {
	chatRoomId: string;
	messages: ChatMessages;
}

interface UseChatRoomStompResult {
	mergedMessages: ChatMessages;
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	retryHeldMessageByClientMessageId: (clientMessageId: string) => void;
}

function isReconciledServerMessage(message: ChatMessage) {
	// NOTE: 서버 확정 메시지(messageId)이며, 클라이언트 원본과 매칭 가능한(clientMessageId) 경우에만 reconcile
	return (
		typeof message.clientMessageId === "string" &&
		message.clientMessageId.length > 0 &&
		typeof message.messageId === "string" &&
		message.messageId.length > 0
	);
}

function getMessageMergeKey(message: ChatMessage) {
	const stableId = message.messageId ?? message.clientMessageId;
	if (stableId) {
		return stableId;
	}
	return `${message.who}:${message.createdAt}:${message.message}`;
}

function mergeMessages(baseMessages: ChatMessages, deliveryMessages: ChatMessages): ChatMessages {
	const merged: ChatMessages = [];
	const seen = new Set<string>();

	for (const message of [...baseMessages, ...deliveryMessages]) {
		const key = getMessageMergeKey(message);
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		merged.push(message);
	}

	return merged.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function parseRequiredUserId(rawUserId: string | undefined): number {
	if (!rawUserId) {
		throw new Error("useChatRoomStomp requires an authenticated user id.");
	}

	const parsed = Number(rawUserId);
	if (Number.isNaN(parsed)) {
		throw new Error("useChatRoomStomp received an invalid authenticated user id.");
	}

	return parsed;
}

export function useChatRoomStomp(props: UseChatRoomStompProps): UseChatRoomStompResult {
	const { chatRoomId, messages } = props;
	const { data: session } = useSession();

	const stompClientRef = useRef<Client | null>(null);
	const isAwaitingJoinAckRef = useRef(false);
	const myMembershipIdRef = useRef<number | null>(null);
	const isStompConnectedRef = useRef(false);

	const myUserId = useMemo(() => parseRequiredUserId(session?.user?.id), [session?.user?.id]);
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

	const { mergedMessages, realtimeChatroomIdRef, setRealtimeChatroomId, setRealtimeMessages } =
		useRealtimeMessageMerge({
			chatroomId: chatRoomId,
			messages,
		});

	const {
		submitMessageByStomp,
		markAsReadByStomp,
		flushPendingMessages,
		handleOwnMessageAck,
		retryHeldMessageByClientMessageId,
		reconcileDeliveredClientMessageIds,
		messageDeliveryIssues,
	} = usePendingStompQueue({
		authHeader,
		chatroomId: chatRoomId,
		userId: myUserId,
		stompClientRef,
		isStompConnectedRef,
		myMembershipIdRef,
	});

	useStompConnectionLifecycle({
		authHeader,
		chatroomId: chatRoomId,
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
		onOwnMessageAck: handleOwnMessageAck,
	});

	const deliveredClientMessageIds = useMemo(() => {
		return [
			...new Set(
				mergedMessages
					.filter(isReconciledServerMessage)
					.map((message) => message.clientMessageId as string),
			),
		];
	}, [mergedMessages]);

	useEffect(() => {
		if (deliveredClientMessageIds.length === 0) {
			return;
		}

		reconcileDeliveredClientMessageIds(deliveredClientMessageIds);
	}, [deliveredClientMessageIds, reconcileDeliveredClientMessageIds]);

	const mergedMessagesWithDeliveryState = useMemo(() => {
		const deliveryMessages: ChatMessages = messageDeliveryIssues.map((issue) => ({
			clientMessageId: issue.clientMessageId,
			who: "me",
			message: issue.text,
			createdAt: issue.createdAt,
			deliveryStatus: issue.status,
		}));

		return mergeMessages(mergedMessages, deliveryMessages);
	}, [mergedMessages, messageDeliveryIssues]);

	return {
		mergedMessages: mergedMessagesWithDeliveryState,
		submitMessageByStomp,
		markAsReadByStomp,
		retryHeldMessageByClientMessageId,
	};
}
