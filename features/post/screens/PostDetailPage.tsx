"use client";

import { PostDetailAction } from "@/features/post/components/PostDetailAction";
import { PostDetailImages } from "@/features/post/components/PostDetailImages";
import { PostDetailMeta } from "@/features/post/components/PostDetailMeta";
import PostDetailNavigation from "@/features/post/components/PostDetailNavigation";
import { PostStateMessage } from "@/features/post/components/PostStateMessage";
import { usePostDetailActions } from "@/features/post/hooks/usePostDetailActions";
import { usePostDetailParams } from "@/features/post/hooks/usePostDetailParams";
import { usePostDetailQuery } from "@/features/post/hooks/usePostDetailQuery";
import { usePostDetailUIState } from "@/features/post/hooks/usePostDetailUIState";

import DefaultHeader from "@/shared/components/layout/headers/DefaultHeader";
import PostDetailHeader from "@/shared/components/layout/headers/PostDetailHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

import { formatKoreanDateYMD, formatRentalFeeLabel } from "@/shared/lib/format";

const POST_DETAIL_LOADING_LABEL = "게시글을 불러오는 중";
const POST_DETAIL_ERROR_LABEL = "게시글을 불러오지 못했습니다.";

export function PostDetailPage() {
	const { normalizedGroupId, normalizedPostId, postIdNumber } = usePostDetailParams();
	const { isDrawerOpen, setIsDrawerOpen, isDeleteDialogOpen, setIsDeleteDialogOpen } =
		usePostDetailUIState();
	const { post, isLoading, updateStatusMutation, deleteMutation } = usePostDetailQuery(
		normalizedGroupId,
		normalizedPostId,
	);

	const rentalStatusValue = post?.rentalStatus ?? "AVAILABLE";
	const isAvailable = rentalStatusValue === "AVAILABLE";

	const {
		handleStatusChange,
		handleOpenDeleteDialog,
		handleConfirmDelete,
		isUpdatingStatus,
		isDeleting,
	} = usePostDetailActions({
		groupId: normalizedGroupId,
		rentalStatusValue,
		updateStatusMutation,
		deleteMutation,
		setIsDrawerOpen,
		setIsDeleteDialogOpen,
	});

	if (isLoading) {
		return (
			<>
				<DefaultHeader />
				<PostStateMessage label={POST_DETAIL_LOADING_LABEL} showSpinner fullHeight />
			</>
		);
	}

	if (!post) {
		return (
			<>
				<DefaultHeader />
				<PostStateMessage label={POST_DETAIL_ERROR_LABEL} fullHeight />
			</>
		);
	}

	const displayDate = formatKoreanDateYMD(post.updatedAt);
	const rentalFeeLabel = formatRentalFeeLabel(post.rentalFee, post.feeUnit);

	return (
		<>
			<PostDetailHeader onClickMore={() => setIsDrawerOpen(true)} isSeller={post.isSeller} />
			<PostDetailAction
				groupId={normalizedGroupId}
				postId={normalizedPostId}
				isDrawerOpen={isDrawerOpen}
				onDrawerOpenChange={setIsDrawerOpen}
				isDeleteDialogOpen={isDeleteDialogOpen}
				onDeleteDialogOpenChange={setIsDeleteDialogOpen}
				onRequestDelete={handleOpenDeleteDialog}
				onConfirmDelete={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
			<div className="flex flex-1 pb-(--h-bottom-nav)">
				<section className="flex flex-1 flex-col h-full overflow-y-scroll no-scrollbar">
					<PostDetailSeller avatarUrl={post.sellerAvatar} nickname={post.sellerNickname} />
					<PostDetailImages images={post.imageUrls.imageInfos} />
					<HorizontalPaddingBox className="mt-3 pb-6">
						<PostDetailMeta
							title={post.title}
							rentalFeeLabel={rentalFeeLabel}
							displayDate={displayDate}
							isSeller={post.isSeller}
							isAvailable={isAvailable}
							rentalStatusValue={rentalStatusValue}
							isUpdatingStatus={isUpdatingStatus}
							onStatusChange={handleStatusChange}
						/>
						<Separator className="my-6" />
						<PostDetailBody content={post.content} />
					</HorizontalPaddingBox>
				</section>
			</div>
			<PostDetailNavigation
				isSeller={post.isSeller}
				activeChatroomCount={post.activeChatroomCount}
				chatroomId={post.chatroomId}
				postId={postIdNumber}
			/>
		</>
	);
}

interface PostDetailSellerProps {
	avatarUrl: string;
	nickname: string;
}

function PostDetailSeller(props: PostDetailSellerProps) {
	const { avatarUrl, nickname } = props;

	return (
		<div className="py-4">
			<HorizontalPaddingBox className="flex gap-x-2 items-center ">
				<Avatar className="w-12.5 h-12.5 border-0">
					<AvatarImage src={avatarUrl} />
					<AvatarFallback></AvatarFallback>
				</Avatar>
				<Typography type="subtitle" className="text-center">
					{nickname}
				</Typography>
			</HorizontalPaddingBox>
		</div>
	);
}

interface PostDetailBodyProps {
	content: string;
}

function PostDetailBody(props: PostDetailBodyProps) {
	const { content } = props;

	return (
		<Typography type="body" className="whitespace-pre-wrap">
			{content}
		</Typography>
	);
}
