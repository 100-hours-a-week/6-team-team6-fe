"use client";

import { useMemo } from "react";

import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import type { GroupPostsError } from "@/features/post/api/getGroupPosts";
import { getGroupPosts } from "@/features/post/api/getGroupPosts";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import type { PostSummariesResponseDto } from "@/features/post/schemas";

type UseGroupPostsParams = {
	groupId: string;
	enabled?: boolean;
};

function useGroupPosts(params: UseGroupPostsParams) {
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

	const loadMore = () => {
		if (!query.hasNextPage || query.isFetchingNextPage) {
			return;
		}
		query.fetchNextPage();
	};

	return {
		...query,
		posts,
		loadMore,
	};
}

export type { UseGroupPostsParams };
export default useGroupPosts;
