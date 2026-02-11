"use client";

import {
	useMutation,
	type UseMutationResult,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { deletePost, DeletePostError } from "@/features/post/api/deletePost";
import { type PostDetailError } from "@/features/post/api/getPostDetail";
import { postQueries } from "@/features/post/api/postQueries";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import {
	updatePostStatus,
	UpdatePostStatusError,
	type UpdatePostStatusResponse,
} from "@/features/post/api/updatePostStatus";
import type { PostDetailDto, RentalStatus } from "@/features/post/schemas";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";

interface UsePostDetailQueryResult {
	post: PostDetailDto | undefined;
	isLoading: boolean;
	isError: boolean;
	error: PostDetailError | null;
	updateStatusMutation: UseMutationResult<
		UpdatePostStatusResponse,
		UpdatePostStatusError,
		RentalStatus,
		{ previous?: PostDetailDto }
	>;
	deleteMutation: UseMutationResult<void, DeletePostError, void, unknown>;
}

function usePostDetailQuery(groupId: string, postId: string): UsePostDetailQueryResult {
	const queryClient = useQueryClient();
	const detailQueryKey = postQueryKeys.detail(groupId, postId);
	const canUsePost = Boolean(groupId) && Boolean(postId);

	const detailQuery = useQuery(postQueries.detail({ groupId, postId, enabled: canUsePost }));

	const updateStatusMutation = useMutation<
		UpdatePostStatusResponse,
		UpdatePostStatusError,
		RentalStatus,
		{ previous?: PostDetailDto }
	>({
		mutationFn: (rentalStatus) => {
			if (!canUsePost) {
				throw new UpdatePostStatusError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return updatePostStatus({ groupId, postId, rentalStatus });
		},
		onMutate: async (status) => {
			await queryClient.cancelQueries({ queryKey: detailQueryKey });
			const previous = queryClient.getQueryData<PostDetailDto>(detailQueryKey);
			if (previous) {
				queryClient.setQueryData<PostDetailDto>(detailQueryKey, {
					...previous,
					rentalStatus: status,
				});
			}
			return { previous };
		},
		onError: (_error, _status, context) => {
			if (context?.previous) {
				queryClient.setQueryData(detailQueryKey, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: detailQueryKey });
		},
	});

	const deleteMutation = useMutation<void, DeletePostError, void>({
		mutationFn: () => {
			if (!canUsePost) {
				throw new DeletePostError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return deletePost({ groupId, postId });
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: detailQueryKey });
			queryClient.invalidateQueries({ queryKey: postQueryKeys.list(groupId) });
		},
	});

	const { data: post, isLoading, isError, error } = detailQuery;

	return {
		post,
		isLoading,
		isError,
		error,
		updateStatusMutation,
		deleteMutation,
	};
}

export { usePostDetailQuery };
export type { UsePostDetailQueryResult };
