"use client";

import { memo, useCallback } from "react";

import Link from "next/link";

import PostItem from "@/features/post/components/PostItem";
import { PostItemSkeletonList } from "@/features/post/components/PostItemSkeletonList";
import { PostStateMessage } from "@/features/post/components/PostStateMessage";
import useGroupPosts from "@/features/post/hooks/useGroupPosts";
import { postRoutes } from "@/features/post/lib/postRoutes";
import type { PostSummaryDto } from "@/features/post/schemas";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";

interface GroupPostsPageProps {
	groupId: string;
}

const GROUP_POSTS_ERROR_LABEL = "게시글을 불러오지 못했습니다.";
const GROUP_POSTS_EMPTY_LABEL = "등록된 게시글이 없습니다.";
const GROUP_POSTS_LOADING_MORE_LABEL = "게시글을 더 불러오는 중";
const GROUP_POSTS_SKELETON_COUNT = 20;

interface GroupPostsListProps {
	groupId: string;
	posts: PostSummaryDto[];
}

const GroupPostsList = memo(function GroupPostsList(props: GroupPostsListProps) {
	const { groupId, posts } = props;
	const lastPostIndex = posts.length - 1;

	return (
		<ul className="flex flex-col gap-6">
			{posts.map((post, index) => (
				<li key={post.postId} className="flex flex-col gap-y-6">
					<HorizontalPaddingBox>
						<Link href={postRoutes.postDetail(groupId, post.postId)}>
							<PostItem {...post} />
						</Link>
					</HorizontalPaddingBox>
					{index !== lastPostIndex ? <Separator /> : null}
				</li>
			))}
		</ul>
	);
});

export function GroupPostsPage(props: GroupPostsPageProps) {
	const { groupId } = props;
	const { posts, isLoading, isError, hasNextPage, isFetchingNextPage, loadMore } = useGroupPosts({
		groupId,
	});
	const isLoadingInitial = isLoading && posts.length === 0;
	const handleIntersect = useCallback(() => {
		loadMore();
	}, [loadMore]);

	const { setTarget } = useIntersectionObserver({
		onIntersect: handleIntersect,
		enabled: hasNextPage,
		// TODO: 200px 상수화
		rootMargin: "0px 0px 200px 0px",
	});

	if (isLoadingInitial) {
		return <PostItemSkeletonList count={GROUP_POSTS_SKELETON_COUNT} className="py-6" />;
	}

	if (isError && posts.length === 0) {
		return <PostStateMessage label={GROUP_POSTS_ERROR_LABEL} fullHeight />;
	}

	if (posts.length === 0) {
		return <PostStateMessage label={GROUP_POSTS_EMPTY_LABEL} />;
	}

	return (
		<div className="flex flex-col gap-6 py-6">
			<GroupPostsList groupId={groupId} posts={posts} />
			{hasNextPage ? (
				isFetchingNextPage ? (
					<PostItemSkeletonList count={GROUP_POSTS_SKELETON_COUNT} />
				) : (
					<HorizontalPaddingBox>
						<div
							ref={setTarget}
							className="flex items-center justify-center gap-2 py-4 text-muted-foreground"
						>
							<Spinner />
							<Typography type="body-sm">{GROUP_POSTS_LOADING_MORE_LABEL}</Typography>
						</div>
					</HorizontalPaddingBox>
				)
			) : null}
		</div>
	);
}
