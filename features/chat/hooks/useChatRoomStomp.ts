import { useMemo, useRef, useState } from "react";

import { useParams } from "next/navigation";

import type { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

import { usePendingStompQueue } from "@/features/chat/hooks/usePendingStompQueue";
import { useStompConnectionLifecycle } from "@/features/chat/hooks/useStompConnectionLifecycle";
import type { ChatMessage, ChatMessages } from "@/features/chat/lib/types";

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
	});

	return {
		mergedMessages,
		submitMessageByStomp,
		markAsReadByStomp,
	};
}
