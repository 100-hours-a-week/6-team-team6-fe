"use client";

import { useCallback, useMemo } from "react";

import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type { GroupPostsError } from "@/features/post/api/getGroupPosts";
import { getGroupPosts } from "@/features/post/api/getGroupPosts";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import type { PostSummariesResponseDto } from "@/features/post/schemas";

type UseGroupPostsParams = {
	groupId: string;
	enabled?: boolean;
};

type UseGroupPostsResult = {
	posts: PostSummariesResponseDto["summaries"];
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	loadMore: () => void;
};

function useGroupPosts(params: UseGroupPostsParams): UseGroupPostsResult {
	const { groupId, enabled = true } = params;
	const queryKey = postQueryKeys.list(groupId);

	const query = useInfiniteQuery<
		PostSummariesResponseDto,
		GroupPostsError,
		InfiniteData<PostSummariesResponseDto, string | undefined>,
		typeof queryKey,
		string | undefined
	>({
		queryKey,
		queryFn: ({ pageParam }) => getGroupPosts({ groupId, cursor: pageParam }),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor : undefined),
		enabled: Boolean(groupId) && enabled,
	});

	const posts = useMemo(
		() => query.data?.pages.flatMap((page) => page.summaries) ?? [],
		[query.data],
	);
	const {
		fetchNextPage,
		hasNextPage,
		isError,
		isFetchingNextPage,
		isLoading,
	} = query;

	const loadMore = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}
		fetchNextPage();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return {
		posts,
		isLoading,
		isError,
		hasNextPage: Boolean(hasNextPage),
		isFetchingNextPage,
		loadMore,
	};
}

export type { UseGroupPostsParams, UseGroupPostsResult };
export default useGroupPosts;
