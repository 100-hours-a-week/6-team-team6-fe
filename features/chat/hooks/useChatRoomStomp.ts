import { useMemo, useRef } from "react";

import { useParams } from "next/navigation";

import type { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

import { usePendingStompQueue } from "@/features/chat/hooks/usePendingStompQueue";
import { useRealtimeMessageMerge } from "@/features/chat/hooks/useRealtimeMessageMerge";
import { useStompConnectionLifecycle } from "@/features/chat/hooks/useStompConnectionLifecycle";
import type { ChatMessages } from "@/features/chat/lib/types";

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

export function useChatRoomStomp(props: UseChatRoomStompProps): UseChatRoomStompResult {
	const { messages, submitMessage } = props;
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
