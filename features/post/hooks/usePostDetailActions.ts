"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import type { UsePostDetailQueryResult } from "@/features/post/hooks/usePostDetailQuery";
import { postRoutes } from "@/features/post/lib/postRoutes";
import type { RentalStatus } from "@/features/post/schemas";

import { getApiErrorMessage } from "@/shared/lib/error-message-map";

interface UsePostDetailActionsParams {
	groupId: string;
	rentalStatusValue: RentalStatus;
	updateStatusMutation: UsePostDetailQueryResult["updateStatusMutation"];
	deleteMutation: UsePostDetailQueryResult["deleteMutation"];
	setIsDrawerOpen: (open: boolean) => void;
	setIsDeleteDialogOpen: (open: boolean) => void;
}

interface UsePostDetailActionsResult {
	isUpdatingStatus: boolean;
	isDeleting: boolean;
	handleStatusChange: (value: string) => void;
	handleOpenDeleteDialog: () => void;
	handleConfirmDelete: () => void;
}

function usePostDetailActions(params: UsePostDetailActionsParams): UsePostDetailActionsResult {
	const {
		groupId,
		rentalStatusValue,
		updateStatusMutation,
		deleteMutation,
		setIsDrawerOpen,
		setIsDeleteDialogOpen,
	} = params;
	const router = useRouter();
	const { mutate: updateStatus, isPending: isUpdatingStatus } = updateStatusMutation;
	const { mutate: deletePost, isPending: isDeleting } = deleteMutation;

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
	}, [setIsDeleteDialogOpen, setIsDrawerOpen]);

	const handleConfirmDelete = useCallback(() => {
		deletePost(undefined, {
			onSuccess: () => {
				toast.success("게시글이 삭제되었습니다.");
				router.replace(postRoutes.groupPosts(groupId));
			},
			onError: (deleteError) => {
				const message = getApiErrorMessage(deleteError?.code ?? "게시글 삭제에 실패했습니다.");
				toast.error(message);
			},
			onSettled: () => setIsDeleteDialogOpen(false),
		});
	}, [deletePost, groupId, router, setIsDeleteDialogOpen]);

	return {
		isUpdatingStatus,
		isDeleting,
		handleStatusChange,
		handleOpenDeleteDialog,
		handleConfirmDelete,
	};
}

export { usePostDetailActions };
export type { UsePostDetailActionsParams, UsePostDetailActionsResult };
