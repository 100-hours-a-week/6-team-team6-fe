"use client";

import { memo, useCallback, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FileTextIcon, ImageIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useMyGroups } from "@/features/group/hooks/useMyGroups";
import { useMyPosts } from "@/features/group/hooks/useMyPosts";
import {
	GROUP_GRID_CAPACITY,
	GROUP_LIMIT,
	GROUP_LIST_LABELS,
} from "@/features/group/lib/constants";
import { groupRoutes } from "@/features/group/lib/groupRoutes";
import type { GroupSummaryDto, MyPostSummaryDto } from "@/features/group/schemas";

import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
import LogoHeader from "@/shared/components/layout/headers/LogoHeader";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";

import { isDirectPreviewImageSrc, normalizeImageSrcForNextImage } from "@/shared/lib/image-src";

const MY_GROUP_CARD_ROOT_CLASS = "flex flex-col gap-1.5";
const MY_GROUP_CARD_MEDIA_CLASS =
	"relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted";

type GroupGridItem =
	| {
			type: "group";
			group: GroupSummaryDto;
	  }
	| {
			type: "create";
	  };

const chunkArray = <T,>(items: T[], chunkSize: number): T[][] => {
	if (chunkSize <= 0) {
		return [items];
	}

	const pages: T[][] = [];
	for (let index = 0; index < items.length; index += chunkSize) {
		pages.push(items.slice(index, index + chunkSize));
	}
	return pages;
};

interface MyGroupCardProps {
	group: GroupSummaryDto;
}

const MyGroupCard = memo(function MyGroupCard(props: MyGroupCardProps) {
	const { group } = props;
	const coverImageUrl = normalizeImageSrcForNextImage(group.groupCoverImageUrl);
	const shouldUseUnoptimizedImage = coverImageUrl ? isDirectPreviewImageSrc(coverImageUrl) : false;

	return (
		<Link href={groupRoutes.posts(group.groupId)} className={`group ${MY_GROUP_CARD_ROOT_CLASS}`}>
			<div className={MY_GROUP_CARD_MEDIA_CLASS}>
				{coverImageUrl ? (
					<Image
						src={coverImageUrl}
						alt={group.groupName}
						fill
						sizes="(max-width: 480px) 30vw, 120px"
						unoptimized={shouldUseUnoptimizedImage}
						className="object-cover transition-transform duration-200 group-hover:scale-105"
					/>
				) : (
					<ImageIcon className="size-7 text-muted-foreground" />
				)}
			</div>
			<Typography type="caption" className="truncate-1 text-center text-foreground">
				{group.groupName}
			</Typography>
		</Link>
	);
});

interface CreateGroupCardProps {
	onClick: () => void;
	isLimitReached: boolean;
}

function CreateGroupCard(props: CreateGroupCardProps) {
	const { onClick, isLimitReached } = props;

	return (
		<button
			type="button"
			onClick={onClick}
			className={`${MY_GROUP_CARD_ROOT_CLASS} w-full cursor-pointer border-0 bg-transparent p-0 text-left appearance-none`}
		>
			<div className={`${MY_GROUP_CARD_MEDIA_CLASS} border-dashed`}>
				<PlusIcon className="size-7 text-foreground" />
			</div>
			<Typography
				type="caption"
				className={`text-center ${isLimitReached ? "text-muted-foreground" : "text-foreground"}`}
			>
				{GROUP_LIST_LABELS.createGroup}
			</Typography>
		</button>
	);
}

interface MyGroupsSectionProps {
	groups: GroupSummaryDto[];
	totalCount: number;
	isLoading: boolean;
	isError: boolean;
	onCreateGroup: () => void;
}

function MyGroupsSection(props: MyGroupsSectionProps) {
	const { groups, totalCount, isLoading, isError, onCreateGroup } = props;
	const limitedGroups = useMemo(() => groups.slice(0, GROUP_LIMIT), [groups]);
	const isLimitReached = totalCount >= GROUP_LIMIT;

	const items = useMemo<GroupGridItem[]>(
		() => [
			...limitedGroups.map((group) => ({ type: "group", group }) as const),
			{ type: "create" },
		],
		[limitedGroups],
	);
	const pages = useMemo(() => chunkArray(items, GROUP_GRID_CAPACITY), [items]);

	if (isLoading) {
		return (
			<section className="flex flex-col gap-3">
				<Typography type="subtitle">{GROUP_LIST_LABELS.myGroupSection}</Typography>
				<div className="grid grid-cols-3 gap-3">
					{Array.from({ length: GROUP_GRID_CAPACITY }).map((_, index) => (
						<Skeleton key={index} className="aspect-square rounded-lg" />
					))}
				</div>
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col gap-3">
				<Typography type="subtitle">{GROUP_LIST_LABELS.myGroupSection}</Typography>
				<Typography type="body-sm" className="text-muted-foreground">
					{GROUP_LIST_LABELS.groupError}
				</Typography>
			</section>
		);
	}

	if (pages.length === 1) {
		return (
			<section className="flex flex-col gap-3">
				<Typography type="subtitle">{GROUP_LIST_LABELS.myGroupSection}</Typography>
				<ul className="grid grid-cols-3 gap-3">
					{pages[0].map((item) => (
						<li key={item.type === "group" ? `group-${item.group.groupId}` : "create-group"}>
							{item.type === "group" ? (
								<MyGroupCard group={item.group} />
							) : (
								<CreateGroupCard onClick={onCreateGroup} isLimitReached={isLimitReached} />
							)}
						</li>
					))}
				</ul>
			</section>
		);
	}

	return (
		<section className="flex flex-col gap-3">
			<Typography type="subtitle">{GROUP_LIST_LABELS.myGroupSection}</Typography>
			<Carousel showDots opts={{ align: "start", containScroll: "trimSnaps" }}>
				<CarouselContent>
					{pages.map((page, pageIndex) => (
						<CarouselItem key={pageIndex}>
							<ul className={`grid grid-cols-3 gap-3 ${pageIndex > 1 ? "pl-4" : ""}`}>
								{page.map((item) => (
									<li key={item.type === "group" ? `group-${item.group.groupId}` : "create-group"}>
										{item.type === "group" ? (
											<MyGroupCard group={item.group} />
										) : (
											<CreateGroupCard onClick={onCreateGroup} isLimitReached={isLimitReached} />
										)}
									</li>
								))}
							</ul>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</section>
	);
}

interface MyPostCardProps {
	post: MyPostSummaryDto;
}

const MyPostCard = memo(function MyPostCard(props: MyPostCardProps) {
	const { post } = props;
	const imageUrl = normalizeImageSrcForNextImage(post.postFirstImageUrl);
	const shouldUseUnoptimizedImage = imageUrl ? isDirectPreviewImageSrc(imageUrl) : false;
	const postCardContent = (
		<>
			<div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={post.postTitle}
						fill
						sizes="(max-width: 480px) 45vw, 200px"
						unoptimized={shouldUseUnoptimizedImage}
						className="object-cover transition-transform duration-200 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						<ImageIcon className="size-8" />
					</div>
				)}
			</div>
			<Typography type="caption" className="truncate-1 text-foreground">
				{post.postTitle}
			</Typography>
		</>
	);

	if (typeof post.groupId !== "number") {
		return <div className="flex flex-col gap-1.5 opacity-70">{postCardContent}</div>;
	}

	return (
		<Link
			href={groupRoutes.postDetail(post.groupId, post.postId)}
			className="group flex flex-col gap-1.5"
		>
			{postCardContent}
		</Link>
	);
});

function MyPostsLoading() {
	return (
		<ul className="grid grid-cols-2 gap-3">
			{Array.from({ length: 4 }).map((_, index) => (
				<li key={index} className="flex flex-col gap-1.5">
					<Skeleton className="aspect-square rounded-lg" />
					<Skeleton className="h-4 w-3/4" />
				</li>
			))}
		</ul>
	);
}

function MyPostsEmpty() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg  px-4 text-center">
			<Typography type="body-sm" className="text-muted-foreground whitespace-pre">
				{GROUP_LIST_LABELS.myPostEmptyTitle}
			</Typography>
		</div>
	);
}

interface MyPostsSectionProps {
	posts: MyPostSummaryDto[];
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	setLoaderRef: (node: HTMLDivElement | null) => void;
}

function MyPostsSection(props: MyPostsSectionProps) {
	const { posts, isLoading, isError, hasNextPage, isFetchingNextPage, setLoaderRef } = props;

	return (
		<section className="flex flex-col gap-3 pb-6">
			<Typography type="subtitle">{GROUP_LIST_LABELS.myPostSection}</Typography>
			{isLoading && posts.length === 0 ? <MyPostsLoading /> : null}
			{isError && posts.length === 0 ? (
				<Typography type="body-sm" className="text-muted-foreground">
					{GROUP_LIST_LABELS.myPostError}
				</Typography>
			) : null}
			{!isLoading && !isError && posts.length === 0 ? <MyPostsEmpty /> : null}
			{posts.length > 0 ? (
				<>
					<ul className="grid grid-cols-2 gap-3">
						{posts.map((post) => (
							<li key={`${post.postId}-${post.postImageId}`}>
								<MyPostCard post={post} />
							</li>
						))}
					</ul>
					{hasNextPage ? <div ref={setLoaderRef} className="h-8" /> : null}
					{isFetchingNextPage ? (
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Spinner />
							<Typography type="body-sm">{GROUP_LIST_LABELS.myPostLoadingMore}</Typography>
						</div>
					) : null}
				</>
			) : null}
		</section>
	);
}

export function GroupListPage() {
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

	const handleCreateGroup = useCallback(() => {
		if (totalCount >= GROUP_LIMIT) {
			toast.error(GROUP_LIST_LABELS.groupLimitExceeded);
			return;
		}
		router.push(groupRoutes.create());
	}, [router, totalCount]);

	const handleIntersect = useCallback(() => {
		loadMore();
	}, [loadMore]);

	const { setTarget } = useIntersectionObserver<HTMLDivElement>({
		onIntersect: handleIntersect,
		enabled: hasNextPage,
		rootMargin: "0px 0px 160px 0px",
	});

	return (
		<>
			<LogoHeader />
			<div className="flex flex-1">
				<section className="flex h-full flex-1 flex-col overflow-y-scroll no-scrollbar pb-(--h-bottom-nav)">
					<div className="flex flex-col gap-8 px-5 py-6">
						<MyGroupsSection
							groups={groups}
							totalCount={totalCount}
							isLoading={isGroupsLoading}
							isError={isGroupsError}
							onCreateGroup={handleCreateGroup}
						/>
						<MyPostsSection
							posts={posts}
							isLoading={isPostsLoading}
							isError={isPostsError}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							setLoaderRef={setTarget}
						/>
					</div>
				</section>
			</div>
			<DefaultNavigation />
		</>
	);
}
