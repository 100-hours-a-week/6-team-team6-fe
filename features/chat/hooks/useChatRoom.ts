import { useCallback, useMemo, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { type InfiniteData, useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import type { GetChatMessagesError } from "@/features/chat/api/getChatMessages";
import { getChatMessages } from "@/features/chat/api/getChatMessages";
import type { GetChatroomPostIdError } from "@/features/chat/api/getChatroomPostId";
import { getChatroomPostId } from "@/features/chat/api/getChatroomPostId";
import type { GetChatroomPostInfoError } from "@/features/chat/api/getChatroomPostInfo";
import { getChatroomPostInfo } from "@/features/chat/api/getChatroomPostInfo";
import type { ChatMessage, ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";
import type { ChatMessagesResponseDto } from "@/features/chat/schemas";

export type UseChatRoomResult = {
	postInfo: ChatPostInfoData | null;
	isPostInfoLoading: boolean;
	isPostInfoError: boolean;
	isMessagesLoading: boolean;
	isMessagesError: boolean;
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

	const messagesQuery = useInfiniteQuery<
		ChatMessagesResponseDto,
		GetChatMessagesError,
		InfiniteData<ChatMessagesResponseDto, string | undefined>,
		ReturnType<typeof chatQueryKeys.chatroomMessages>,
		string | undefined
	>({
		queryKey: chatQueryKeys.chatroomMessages(chatroomId, resolvedPostId),
		queryFn: ({ pageParam }) =>
			getChatMessages({
				postId: resolvedPostId as number,
				chatroomId: chatroomId as number,
				cursor: pageParam,
			}),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
		enabled: chatroomId !== null && resolvedPostId !== null,
	});

	const [optimisticMessages, setOptimisticMessages] = useState<ChatMessages>([]);

	const messages = useMemo(() => {
		const fetched = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];
		if (optimisticMessages.length === 0) {
			return fetched;
		}
		return [...optimisticMessages, ...fetched];
	}, [messagesQuery.data, optimisticMessages]);

	const loadMoreMessages = useCallback(() => {
		if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) {
			return;
		}
		void messagesQuery.fetchNextPage();
	}, [messagesQuery]);

	const submitMessage = useCallback((text: string) => {
		const nextMessage: ChatMessage = {
			messageId: `local-${Date.now()}`,
			who: "me",
			message: text,
			createdAt: new Date().toISOString(),
		};
		setOptimisticMessages((prev) => [nextMessage, ...prev]);
	}, []);

	return {
		postInfo: postInfoQuery.data ?? null,
		isPostInfoLoading: postInfoQuery.isLoading || postIdQuery.isLoading,
		isPostInfoError: postInfoQuery.isError || postIdQuery.isError,
		isMessagesLoading: messagesQuery.isLoading,
		isMessagesError: messagesQuery.isError,
		messages,
		hasMoreMessage: messagesQuery.hasNextPage ?? false,
		isLoadingPreviousMessage: messagesQuery.isFetchingNextPage,
		loadMoreMessages,
		submitMessage,
	};
}
