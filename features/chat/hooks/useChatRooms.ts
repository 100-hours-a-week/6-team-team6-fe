import { useMemo } from "react";

import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import type { ChatRoomsError } from "@/features/chat/api/getChatRooms";
import { getChatRooms } from "@/features/chat/api/getChatRooms";
import type { ChatRoomsResponseDto } from "@/features/chat/schemas";

type UseChatRoomsParams = {
	postId: number | null;
	listType: "all" | "item";
};

export function useChatRooms({ postId, listType }: UseChatRoomsParams) {
	const queryKey = chatQueryKeys.list({ type: listType, postId });

	const query = useInfiniteQuery<
		ChatRoomsResponseDto,
		ChatRoomsError,
		InfiniteData<ChatRoomsResponseDto, string | undefined>,
		typeof queryKey,
		string | undefined
	>({
		queryKey,
		queryFn: ({ pageParam }) =>
			getChatRooms({ cursor: pageParam, postId: postId ?? undefined, listType }),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
	});

	const rooms = useMemo(() => {
		const mergedRooms = query.data?.pages.flatMap((page) => page.rooms) ?? [];
		if (postId === null) {
			return mergedRooms;
		}
		return mergedRooms.filter((room) => room.postId === postId);
	}, [postId, query.data]);

	return {
		rooms,
		fetchNextPage: query.fetchNextPage,
		hasNextPage: query.hasNextPage ?? false,
		isFetchingNextPage: query.isFetchingNextPage,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
