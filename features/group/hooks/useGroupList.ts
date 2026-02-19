"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useMyGroups } from "@/features/group/hooks/useMyGroups";
import { useMyPosts } from "@/features/group/hooks/useMyPosts";
import { groupRoutes } from "@/features/group/lib/groupRoutes";
import type { GroupSummaryDto, MyPostSummaryDto } from "@/features/group/schemas";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";

interface UseGroupListOptions {
	rootMargin?: string;
}

interface GroupListState {
	groups: GroupSummaryDto[];
	totalCount: number;
	isGroupsLoading: boolean;
	isGroupsError: boolean;
	posts: MyPostSummaryDto[];
	isPostsLoading: boolean;
	isPostsError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	setLoaderRef: (node: HTMLDivElement | null) => void;
}

interface GroupListActions {
	createGroup: () => void;
}

function useGroupList(options: UseGroupListOptions = {}): {
	state: GroupListState;
	actions: GroupListActions;
} {
	const { rootMargin = "0px 0px 160px 0px" } = options;
	const router = useRouter();
	const { groups, totalCount, isLoading: isGroupsLoading, isError: isGroupsError } = useMyGroups();
	const {
		posts,
		isLoading: isPostsLoading,
		isError: isPostsError,
		hasNextPage,
		isFetchingNextPage,
		loadMore,
	} = useMyPosts();

	const createGroup = useCallback(() => {
		router.push(groupRoutes.create());
	}, [router]);

	const handleIntersect = useCallback(() => {
		loadMore();
	}, [loadMore]);

	const { setTarget } = useIntersectionObserver<HTMLDivElement>({
		onIntersect: handleIntersect,
		enabled: hasNextPage,
		rootMargin,
	});

	return {
		state: {
			groups,
			totalCount,
			isGroupsLoading,
			isGroupsError,
			posts,
			isPostsLoading,
			isPostsError,
			hasNextPage,
			isFetchingNextPage,
			setLoaderRef: setTarget,
		},
		actions: {
			createGroup,
		},
	};
}

export type { GroupListActions, GroupListState, UseGroupListOptions };
export { useGroupList };
