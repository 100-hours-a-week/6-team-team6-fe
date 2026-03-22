"use client";

import Image from "next/image";
import Link from "next/link";

import { groupRoutes } from "@/features/group/lib/groupRoutes";
import type { PostRecommendationDto } from "@/features/post/schemas";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Typography } from "@/shared/components/ui/typography";

import { formatRentalFeeLabel } from "@/shared/lib/format";
import { isDirectPreviewImageSrc, normalizeImageSrcForNextImage } from "@/shared/lib/image-src";

interface RecommendedPostsSectionProps {
	groupId: string;
	recommendations: PostRecommendationDto[];
	isLoading?: boolean;
}

function RecommendedPostsSection(props: RecommendedPostsSectionProps) {
	const { groupId, recommendations, isLoading = false } = props;

	if (!isLoading && recommendations.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-y-4 pb-10">
			<div className="flex items-end justify-between gap-x-4">
				<div className="space-y-1">
					<Typography type="subtitle" className="text-xl">
						이런 물품은 어때요?
					</Typography>
					<Typography type="caption" className="block text-sm">
						좌우로 넘겨서 비슷한 대여 물품을 둘러보세요.
					</Typography>
				</div>
			</div>
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex gap-x-4 pb-4">
					{isLoading
						? Array.from({ length: 4 }).map((_, index) => (
								<RecommendedPostCardSkeleton key={index} />
							))
						: recommendations.map((item) => (
								<RecommendedPostCard key={item.postId} groupId={groupId} item={item} />
							))}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

interface RecommendedPostCardProps {
	groupId: string;
	item: PostRecommendationDto;
}

function RecommendedPostCard(props: RecommendedPostCardProps) {
	const { groupId, item } = props;
	const imageUrl = normalizeImageSrcForNextImage(item.postFirstImageUrl) ?? "/dummy-post-image.png";
	const shouldUseUnoptimizedImage = isDirectPreviewImageSrc(imageUrl);

	return (
		<article className="group w-40 shrink-0">
			<Link href={groupRoutes.postDetail(groupId, item.postId)} className="block">
				<div className="overflow-hidden border">
					<div className="relative aspect-square overflow-hidden bg-muted">
						<Image
							fill
							src={imageUrl}
							alt={item.postTitle}
							sizes="160px"
							unoptimized={shouldUseUnoptimizedImage}
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
						{item.rentalStatus === "RENTED_OUT" ? (
							<Badge
								variant="secondary"
								className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm"
							>
								대여 중
							</Badge>
						) : null}
					</div>
					<div className="flex flex-col gap-y-1.5 p-3">
						<Typography type="subtitle" className="line-clamp-2 whitespace-normal leading-snug">
							{item.postTitle}
						</Typography>
						<Typography type="body-sm">
							{formatRentalFeeLabel(item.rentalFee, item.feeUnit)}
						</Typography>
					</div>
				</div>
			</Link>
		</article>
	);
}

function RecommendedPostCardSkeleton() {
	return (
		<div className="w-40 shrink-0">
			<div className="overflow-hidden border">
				<Skeleton className="aspect-square" />
				<div className="space-y-1.5 p-3">
					<Skeleton className="h-5 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		</div>
	);
}

export { RecommendedPostsSection };
export type { RecommendedPostsSectionProps };
