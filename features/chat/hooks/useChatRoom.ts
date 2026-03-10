import { useCallback, useMemo } from "react";

import { type InfiniteData, useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import type { GetChatMessagesError } from "@/features/chat/api/getChatMessages";
import { getChatMessages } from "@/features/chat/api/getChatMessages";
import type { GetChatroomPostIdError } from "@/features/chat/api/getChatroomPostId";
import { getChatroomPostId } from "@/features/chat/api/getChatroomPostId";
import type { GetChatroomPostInfoError } from "@/features/chat/api/getChatroomPostInfo";
import { getChatroomPostInfo } from "@/features/chat/api/getChatroomPostInfo";
import type { ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";
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
};

type UseChatRoomParams = {
	chatroomId: string;
	initialPostId: number | null;
};

const CHAT_ROOM_PREFETCH_STALE_TIME_MS = 60_000;

export function useChatRoom(params: UseChatRoomParams): UseChatRoomResult {
	const { chatroomId, initialPostId } = params;

	const postIdQuery = useQuery<{ postId: number }, GetChatroomPostIdError>({
		queryKey: chatQueryKeys.chatroomPostId(chatroomId),
		queryFn: () => getChatroomPostId({ chatroomId }),
		enabled: initialPostId === null,
		staleTime: CHAT_ROOM_PREFETCH_STALE_TIME_MS,
	});

	const resolvedPostId = initialPostId ?? postIdQuery.data?.postId ?? null;

	const postInfoQuery = useQuery<ChatPostInfoData, GetChatroomPostInfoError>({
		queryKey: chatQueryKeys.chatroomPostInfo(chatroomId, resolvedPostId),
		queryFn: () =>
			getChatroomPostInfo({
				postId: resolvedPostId as number,
				chatroomId,
			}),
		enabled: resolvedPostId !== null,
		staleTime: CHAT_ROOM_PREFETCH_STALE_TIME_MS,
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
				chatroomId,
				cursor: pageParam,
			}),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
		enabled: resolvedPostId !== null,
	});

	const messages = useMemo(() => {
		return messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];
	}, [messagesQuery.data]);

	const loadMoreMessages = useCallback(() => {
		if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) {
			return;
		}
		void messagesQuery.fetchNextPage();
	}, [messagesQuery]);

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
	};
}
