import { useMemo, useRef } from "react";

import { useParams } from "next/navigation";

import type { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

import {
	usePendingStompQueue,
} from "@/features/chat/hooks/usePendingStompQueue";
import { useRealtimeMessageMerge } from "@/features/chat/hooks/useRealtimeMessageMerge";
import { useStompConnectionLifecycle } from "@/features/chat/hooks/useStompConnectionLifecycle";
import { buildWebSocketEndpoint } from "@/features/chat/lib/stomp";
import type { ChatMessage, ChatMessages } from "@/features/chat/lib/types";

interface UseChatRoomStompProps {
	messages: ChatMessages;
}

interface UseChatRoomStompResult {
	mergedMessages: ChatMessages;
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	retryHeldMessageByClientMessageId: (clientMessageId: string) => void;
}

function getMessageMergeKey(message: ChatMessage) {
	const stableId = message.clientMessageId ?? message.messageId;
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

export function useChatRoomStomp(props: UseChatRoomStompProps): UseChatRoomStompResult {
	const { messages } = props;
	const params = useParams<{ chatRoomId?: string }>();
	const { data: session } = useSession();

	const stompClientRef = useRef<Client | null>(null);
	const isAwaitingJoinAckRef = useRef(false);
	const myMembershipIdRef = useRef<number | null>(null);
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

	const { mergedMessages, realtimeChatroomIdRef, setRealtimeChatroomId, setRealtimeMessages } =
		useRealtimeMessageMerge({
			chatroomId,
			messages,
		});

	const {
		submitMessageByStomp,
		markAsReadByStomp,
		flushPendingMessages,
		handleOwnMessageAck,
		retryHeldMessageByClientMessageId,
		messageDeliveryIssues,
	} = usePendingStompQueue({
		authHeader,
		chatroomId,
		userId: myUserId,
		stompClientRef,
		isStompConnectedRef,
		myMembershipIdRef,
	});

	useStompConnectionLifecycle({
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
		onOwnMessageAck: handleOwnMessageAck,
	});

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
