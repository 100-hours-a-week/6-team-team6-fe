"use client";

import { useCallback } from "react";

import Link from "next/link";

import PostItem from "@/features/post/components/PostItem";
import useGroupPosts from "@/features/post/hooks/useGroupPosts";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";

interface GroupPostsPageProps {
	groupId: string;
}

const GROUP_POSTS_LOADING_LABEL = "게시글을 불러오는 중";
const GROUP_POSTS_ERROR_LABEL = "게시글을 불러오지 못했습니다.";
const GROUP_POSTS_EMPTY_LABEL = "등록된 게시글이 없습니다.";
const GROUP_POSTS_LOADING_MORE_LABEL = "게시글을 더 불러오는 중";

export function GroupPostsPage(props: GroupPostsPageProps) {
	const { groupId } = props;
	const { posts, isLoading, isError, hasNextPage, isFetchingNextPage, loadMore } = useGroupPosts({
		groupId,
	});
	const isLoadingInitial = isLoading && posts.length === 0;
	const handleIntersect = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}
		loadMore();
	}, [hasNextPage, isFetchingNextPage, loadMore]);

	const { setTarget } = useIntersectionObserver({
		onIntersect: handleIntersect,
		enabled: hasNextPage,
		rootMargin: "0px 0px 200px 0px",
	});

	if (isLoadingInitial) {
		return (
			<div className="h-full flex items-center justify-center gap-2 py-10 text-muted-foreground">
				<Spinner />
				<Typography type="body-sm">{GROUP_POSTS_LOADING_LABEL}</Typography>
			</div>
		);
	}

	if (isError && posts.length === 0) {
		return (
			<div className="h-full flex items-center justify-center py-10 text-muted-foreground">
				<Typography type="body-sm">{GROUP_POSTS_ERROR_LABEL}</Typography>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="flex items-center justify-center py-10 text-muted-foreground">
				<Typography type="body-sm">{GROUP_POSTS_EMPTY_LABEL}</Typography>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 py-6">
			<ul className="flex flex-col gap-6">
				{posts.map((post, index) => (
					<li key={post.postId} className="flex flex-col gap-y-6">
						<HorizontalPaddingBox>
							<Link href={`/groups/${groupId}/posts/${post.postId}`}>
								<PostItem {...post} />
							</Link>
						</HorizontalPaddingBox>
						{index !== posts.length - 1 ? <Separator /> : null}
					</li>
				))}
			</ul>
			{hasNextPage ? (
				<HorizontalPaddingBox>
					<div
						ref={setTarget}
						className="flex items-center justify-center gap-2 py-4 text-muted-foreground"
					>
						{isFetchingNextPage ? (
							<>
								<Spinner />
								<Typography type="body-sm">{GROUP_POSTS_LOADING_MORE_LABEL}</Typography>
							</>
						) : null}
					</div>
				</HorizontalPaddingBox>
			) : null}
		</div>
	);
}
