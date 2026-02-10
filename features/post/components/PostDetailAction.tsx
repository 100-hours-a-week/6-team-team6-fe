"use client";

import Link from "next/link";

import { postRoutes } from "@/features/post/lib/postRoutes";

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
import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTitle,
} from "@/shared/components/ui/drawer";

interface PostDetailActionProps {
	groupId: string;
	postId: string;
	isDrawerOpen: boolean;
	onDrawerOpenChange: (open: boolean) => void;
	isDeleteDialogOpen: boolean;
	onDeleteDialogOpenChange: (open: boolean) => void;
	onRequestDelete: () => void;
	onConfirmDelete: () => void;
	isDeleting: boolean;
}

function PostDetailAction(props: PostDetailActionProps) {
	const {
		groupId,
		postId,
		isDrawerOpen,
		onDrawerOpenChange,
		isDeleteDialogOpen,
		onDeleteDialogOpenChange,
		onRequestDelete,
		onConfirmDelete,
		isDeleting,
	} = props;

	return (
		<>
			<Drawer open={isDrawerOpen} onOpenChange={onDrawerOpenChange}>
				<DrawerContent>
					<DrawerTitle />
					<DrawerFooter>
						<Button asChild size="xl">
							<Link href={postRoutes.postEdit(groupId, postId)}>수정하기</Link>
						</Button>
						<Button size="xl" variant="destructive" onClick={onRequestDelete}>
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
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
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
							onClick={onConfirmDelete}
							disabled={isDeleting}
						>
							삭제
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export { PostDetailAction };
export type { PostDetailActionProps };
