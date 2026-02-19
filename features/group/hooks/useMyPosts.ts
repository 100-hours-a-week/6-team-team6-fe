"use client";

import { useCallback, useMemo } from "react";

import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import { getMyPosts, type MyPostsError } from "@/features/group/api/getMyPosts";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import type { MyPostSummariesResponseDto } from "@/features/group/schemas";

function useMyPosts() {
	const queryKey = groupQueryKeys.myPosts();

	const query = useInfiniteQuery<
		MyPostSummariesResponseDto,
		MyPostsError,
		InfiniteData<MyPostSummariesResponseDto, string | undefined>,
		typeof queryKey,
		string | undefined
	>({
		queryKey,
		queryFn: ({ pageParam }) => getMyPosts({ cursor: pageParam }),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
	});

	const posts = useMemo(
		() => query.data?.pages.flatMap((page) => page.summaries) ?? [],
		[query.data],
	);
	const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, isLoading } = query;

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

export { useMyPosts };
