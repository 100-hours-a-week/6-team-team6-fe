// TODO: 404
"use client";

import { useState } from "react";

import Image from "next/image";
import { notFound, useParams } from "next/navigation";

import { toast } from "sonner";

import { DUMMY_POSTS } from "@/features/post/constants";

import PostDetailNavigation from "@/shared/components/layout/bottomNavigations/PostDetailNavigation";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

function PostDetailPage() {
	const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const postIdNumber = Number(postId);
	const post = DUMMY_POSTS.find((item) => item.postId === postIdNumber);

	if (!post) {
		notFound();
	}

	const rentalStatusValue = post.rentalStatus === "RENTED_OUT" ? "rented_out" : "available";
	const isAvailable = rentalStatusValue === "available";

	return (
		<>
			<PostDetailHeader onClickMore={() => setIsDrawerOpen(true)} isSeller={post.isSeller} />
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent>
					<DrawerTitle />
					<DrawerFooter>
						<Button size="xl">수정하기</Button>
						<Button
							size="xl"
							variant="destructive"
							onClick={() => {
								setIsDrawerOpen(false);
								setIsDeleteDialogOpen(true);
								toast.success("삭제되었습니다.");
							}}
						>
							삭제하기
						</Button>
						<DrawerClose>
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
						<AlertDialogCancel className="flex flex-2">취소</AlertDialogCancel>
						<AlertDialogAction className="flex flex-2" variant="destructive">
							삭제
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className="flex flex-1 pb-(--h-bottom-nav)">
				<section className={`flex flex-1 flex-col h-full overflow-y-scroll no-scrollbar`}>
					<div className="py-4">
						<HorizontalPaddingBox className="flex gap-x-2 items-center ">
							<Avatar className="w-12.5 h-12.5 border-0">
								<AvatarImage src={post.sellerAvartar} />
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
								{post.images.map((image, index) => (
									<CarouselItem key={index} className="pl-0">
										<Image
											width={100}
											height={100}
											src={image}
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
								<Typography
									type="title"
									className="text-xl"
								>{`${post.rentalFee} / ${post.feeUnit === "DAY" ? "일" : "시간"}`}</Typography>
								{post.isSeller && (
									<Select defaultValue={rentalStatusValue}>
										<SelectTrigger size="sm" aria-label="대여 상태">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="available">
												<Typography>대여 가능</Typography>
											</SelectItem>
											<SelectItem value="rented_out">
												<Typography>대여중</Typography>
											</SelectItem>
										</SelectContent>
									</Select>
								)}
							</div>
							<div>{post.updatedAt}</div>
						</div>
						<Separator className="my-6" />
						<Typography type="body">{post.content}</Typography>
					</HorizontalPaddingBox>
				</section>
			</div>
			<PostDetailNavigation
				isSeller={post.isSeller}
				activeChatroomCount={post.activeChatroomCount}
				postId={post.postId}
			/>
		</>
	);
}

export default PostDetailPage;
