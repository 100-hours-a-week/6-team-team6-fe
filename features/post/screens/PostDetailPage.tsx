"use client";

import { useCallback, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import { PostDetailAction } from "@/features/post/components/PostDetailAction";
import { PostDetailImages } from "@/features/post/components/PostDetailImages";
import { PostDetailMeta } from "@/features/post/components/PostDetailMeta";
import PostDetailNavigation from "@/features/post/components/PostDetailNavigation";
import { PostStateMessage } from "@/features/post/components/PostStateMessage";
import usePost from "@/features/post/hooks/usePost";
import { postRoutes } from "@/features/post/lib/postRoutes";
import type { RentalStatus } from "@/features/post/schemas";

import PostDetailHeader from "@/shared/components/layout/headers/PostDetailHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { formatKoreanDateYMD, formatRentalFeeLabel } from "@/shared/lib/format";

const POST_DETAIL_LOADING_LABEL = "게시글을 불러오는 중";
const POST_DETAIL_ERROR_LABEL = "게시글을 불러오지 못했습니다.";

// TODO: 404
export function PostDetailPage() {
	const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
	const router = useRouter();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const normalizedGroupId = groupId ?? "";
	const normalizedPostId = postId ?? "";
	const postIdNumber = Number(postId);

	const { detailQuery, updateStatusMutation, deleteMutation } = usePost({
		groupId: normalizedGroupId,
		postId: normalizedPostId,
	});
	const { data: post, isLoading, isError, error } = detailQuery;
	const { mutate: updateStatus, isPending: isUpdatingStatus } = updateStatusMutation;
	const { mutate: deletePost, isPending: isDeleting } = deleteMutation;

	const errorCode = error?.code;
	const shouldNotFound =
		Number.isNaN(postIdNumber) ||
		errorCode === apiErrorCodes.GROUP_NOT_FOUND ||
		errorCode === apiErrorCodes.POST_NOT_FOUND;

	if (shouldNotFound) {
		notFound();
	}

	const rentalStatusValue = post?.rentalStatus ?? "AVAILABLE";
	const isAvailable = rentalStatusValue === "AVAILABLE";

	const handleStatusChange = useCallback(
		(value: string) => {
			if (value === rentalStatusValue) {
				return;
			}
			updateStatus(value as RentalStatus, {
				onSuccess: () => toast.success("대여 상태가 변경되었습니다."),
				onError: (statusError) => {
					const message = getApiErrorMessage(statusError?.code ?? "대여 상태 변경에 실패했습니다.");
					toast.error(message);
				},
			});
		},
		[rentalStatusValue, updateStatus],
	);

	const handleOpenDeleteDialog = useCallback(() => {
		setIsDrawerOpen(false);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		deletePost(undefined, {
			onSuccess: () => {
				toast.success("게시글이 삭제되었습니다.");
				router.replace(postRoutes.groupPosts(normalizedGroupId));
			},
			onError: (deleteError) => {
				const message = getApiErrorMessage(deleteError?.code ?? "게시글 삭제에 실패했습니다.");
				toast.error(message);
			},
			onSettled: () => setIsDeleteDialogOpen(false),
		});
	}, [deletePost, normalizedGroupId, router]);

	if (isLoading) {
		return <PostStateMessage label={POST_DETAIL_LOADING_LABEL} showSpinner fullHeight />;
	}

	if (isError || !post) {
		return <PostStateMessage label={POST_DETAIL_ERROR_LABEL} fullHeight />;
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
