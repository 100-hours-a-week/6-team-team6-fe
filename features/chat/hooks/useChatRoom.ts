import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import type { GetChatroomPostIdError } from "@/features/chat/api/getChatroomPostId";
import { getChatroomPostId } from "@/features/chat/api/getChatroomPostId";
import type { GetChatroomPostInfoError } from "@/features/chat/api/getChatroomPostInfo";
import { getChatroomPostInfo } from "@/features/chat/api/getChatroomPostInfo";
import { INITIAL_MESSAGES, OLDER_MESSAGES } from "@/features/chat/lib/dummy";
import type { ChatMessage, ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";

const LOAD_MORE_DELAY_MS = 300;

export type UseChatRoomResult = {
	postInfo: ChatPostInfoData | null;
	isPostInfoLoading: boolean;
	isPostInfoError: boolean;
	messages: ChatMessages;
	hasMoreMessage: boolean;
	isLoadingPreviousMessage: boolean;
	loadMoreMessages: () => void;
	submitMessage: (text: string) => void;
};

export function useChatRoom(): UseChatRoomResult {
	const params = useParams<{ chatRoomId?: string }>();
	const searchParams = useSearchParams();
	const chatroomId = useMemo(() => {
		const raw = params?.chatRoomId;
		if (!raw) {
			return null;
		}
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? null : parsed;
	}, [params]);
	const postIdFromQuery = useMemo(() => {
		const raw = searchParams.get("postId");
		if (!raw) {
			return null;
		}
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? null : parsed;
	}, [searchParams]);

	const postIdQuery = useQuery<{ postId: number }, GetChatroomPostIdError>({
		queryKey: chatQueryKeys.chatroomPostId(chatroomId),
		queryFn: () => getChatroomPostId({ chatroomId: chatroomId as number }),
		enabled: chatroomId !== null && postIdFromQuery === null,
	});

	const resolvedPostId = postIdFromQuery ?? postIdQuery.data?.postId ?? null;

	const postInfoQuery = useQuery<ChatPostInfoData, GetChatroomPostInfoError>({
		queryKey: chatQueryKeys.chatroomPostInfo(chatroomId, resolvedPostId),
		queryFn: () =>
			getChatroomPostInfo({
				postId: resolvedPostId as number,
				chatroomId: chatroomId as number,
			}),
		enabled: chatroomId !== null && resolvedPostId !== null,
	});

	const [messages, setMessages] = useState<ChatMessages>(INITIAL_MESSAGES);
	const [hasMoreMessage, setHasMoreMessage] = useState(true);
	const [isLoadingPreviousMessage, setIsLoadingPreviousMessage] = useState(false);
	const loadMoreTimerRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (loadMoreTimerRef.current !== null) {
				window.clearTimeout(loadMoreTimerRef.current);
			}
		};
	}, []);

	const loadMoreMessages = useCallback(() => {
		if (!hasMoreMessage || isLoadingPreviousMessage) {
			return;
		}
		setIsLoadingPreviousMessage(true);

		loadMoreTimerRef.current = window.setTimeout(() => {
			setMessages((prev) => [...prev, ...OLDER_MESSAGES]);
			setHasMoreMessage(false);
			setIsLoadingPreviousMessage(false);
			loadMoreTimerRef.current = null;
		}, LOAD_MORE_DELAY_MS);
	}, [hasMoreMessage, isLoadingPreviousMessage]);

	const submitMessage = useCallback((text: string) => {
		const nextMessage: ChatMessage = {
			who: "me",
			message: text,
			createdAt: new Date().toISOString(),
		};
		setMessages((prev) => [nextMessage, ...prev]);
	}, []);

	return {
		postInfo: postInfoQuery.data ?? null,
		isPostInfoLoading: postInfoQuery.isLoading || postIdQuery.isLoading,
		isPostInfoError: postInfoQuery.isError || postIdQuery.isError,
		messages,
		hasMoreMessage,
		isLoadingPreviousMessage,
		loadMoreMessages,
		submitMessage,
	};
}
