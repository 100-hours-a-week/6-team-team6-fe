"use client";

import { useCallback, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import PostDetailNavigation from "@/features/post/components/PostDetailNavigation";
import usePost from "@/features/post/hooks/usePost";
import type { RentalStatus } from "@/features/post/schemas";

import PostDetailHeader from "@/shared/components/layout/headers/PostDetailHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { SelectField, type SelectOption } from "@/shared/components/ui/select-field";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { formatKoreanDateYMD, formatRentalFeeLabel } from "@/shared/lib/format";

const rentalStatusOptions: SelectOption[] = [
	{ value: "AVAILABLE", label: <Typography>대여 가능</Typography> },
	{ value: "RENTED_OUT", label: <Typography>대여중</Typography> },
];
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
				router.replace(`/groups/${normalizedGroupId}/posts`);
			},
			onError: (deleteError) => {
				const message = getApiErrorMessage(deleteError?.code ?? "게시글 삭제에 실패했습니다.");
				toast.error(message);
			},
			onSettled: () => setIsDeleteDialogOpen(false),
		});
	}, [deletePost, normalizedGroupId, router]);

	const displayDate = useMemo(() => (post ? formatKoreanDateYMD(post.updatedAt) : ""), [post]);

	const rentalFeeLabel = useMemo(
		() => (post ? formatRentalFeeLabel(post.rentalFee, post.feeUnit) : ""),
		[post],
	);

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center gap-2 py-10 text-muted-foreground">
				<Spinner />
				<Typography type="body-sm">{POST_DETAIL_LOADING_LABEL}</Typography>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="h-full flex items-center justify-center py-10 text-muted-foreground">
				<Typography type="body-sm">{POST_DETAIL_ERROR_LABEL}</Typography>
			</div>
		);
	}

	return (
		<>
			<PostDetailHeader onClickMore={() => setIsDrawerOpen(true)} isSeller={post.isSeller} />
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent>
					<DrawerTitle />
					<DrawerFooter>
						<Button asChild size="xl">
							<Link href={`/groups/${normalizedGroupId}/posts/${normalizedPostId}/edit`}>
								수정하기
							</Link>
						</Button>
						<Button size="xl" variant="destructive" onClick={handleOpenDeleteDialog}>
							삭제하기
						</Button>
						<DrawerClose asChild>
							<Button size="xl" variant="outline" className="w-full">
								닫기
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>게시글을 삭제할까요?</AlertDialogTitle>
						<AlertDialogDescription>삭제하면 복구할 수 없어요.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-row justify-end">
						<AlertDialogCancel className="flex flex-2" disabled={isDeleting}>
							취소
						</AlertDialogCancel>
						<AlertDialogAction
							className="flex flex-2"
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={isDeleting}
						>
							삭제
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className="flex flex-1 pb-(--h-bottom-nav)">
				<section className="flex flex-1 flex-col h-full overflow-y-scroll no-scrollbar">
					<div className="py-4">
						<HorizontalPaddingBox className="flex gap-x-2 items-center ">
							<Avatar className="w-12.5 h-12.5 border-0">
								<AvatarImage src={post.sellerAvatar} />
								<AvatarFallback></AvatarFallback>
							</Avatar>
							<Typography type="subtitle" className="text-center">
								{post.sellerNickname}
							</Typography>
						</HorizontalPaddingBox>
					</div>
					<div>
						<Carousel showDots>
							<CarouselContent>
								{post.imageUrls.imageInfos.map((image, index) => (
									<CarouselItem key={image.postImageId} className="pl-0">
										<Image
											width={100}
											height={100}
											src={image.imageUrl}
											alt={`Post image ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</CarouselItem>
								))}
							</CarouselContent>
						</Carousel>
					</div>
					<HorizontalPaddingBox className="mt-3 pb-6">
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<Typography type="title">{post.title}</Typography>
								{!post.isSeller && !isAvailable && <Badge>대여중</Badge>}
							</div>
							<div className="flex items-center justify-between">
								<Typography type="title" className="text-xl">
									{rentalFeeLabel}
								</Typography>
								{post.isSeller && (
									<SelectField
										value={rentalStatusValue}
										options={rentalStatusOptions}
										onValueChange={handleStatusChange}
										ariaLabel="대여 상태"
										size="sm"
										disabled={isUpdatingStatus}
									/>
								)}
							</div>
							<div>{displayDate}</div>
						</div>
						<Separator className="my-6" />
						<Typography type="body" className="whitespace-pre-wrap">
							{post.content}
						</Typography>
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
