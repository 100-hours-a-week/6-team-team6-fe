"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createPost,
	type CreatePostError,
	type CreatePostParams,
	type CreatePostResponse,
} from "@/features/post/api/createPost";
import { deletePost, DeletePostError } from "@/features/post/api/deletePost";
import { postQueries } from "@/features/post/api/postQueries";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import {
	updatePost,
	UpdatePostError,
	type UpdatePostParams,
	type UpdatePostResponse,
} from "@/features/post/api/updatePost";
import {
	updatePostStatus,
	UpdatePostStatusError,
	type UpdatePostStatusParams,
	type UpdatePostStatusResponse,
} from "@/features/post/api/updatePostStatus";
import type { PostDetailDto } from "@/features/post/schemas";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";

type UsePostParams = {
	groupId: string;
	postId?: string;
	enabled?: boolean;
};

function usePost(params: UsePostParams) {
	const { groupId, postId, enabled = true } = params;
	const queryClient = useQueryClient();
	const detailQueryKey = postQueryKeys.detail(groupId, postId ?? "");
	const listQueryKey = postQueryKeys.list(groupId);
	const canUsePost = Boolean(groupId) && Boolean(postId);

	const detailQuery = useQuery(
		postQueries.detail({ groupId, postId: postId ?? "", enabled: canUsePost && enabled }),
	);

	const createMutation = useMutation<
		CreatePostResponse,
		CreatePostError,
		Omit<CreatePostParams, "groupId">
	>({
		mutationFn: (payload) => createPost({ groupId, ...payload }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});

	const updateMutation = useMutation<
		UpdatePostResponse,
		UpdatePostError,
		Omit<UpdatePostParams, "groupId" | "postId">
	>({
		mutationFn: (payload) => {
			if (!canUsePost || !postId) {
				throw new UpdatePostError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return updatePost({ groupId, postId, ...payload });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: detailQueryKey });
			queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});

	const updateStatusMutation = useMutation<
		UpdatePostStatusResponse,
		UpdatePostStatusError,
		UpdatePostStatusParams["rentalStatus"],
		{ previous?: PostDetailDto }
	>({
		mutationFn: (rentalStatus) => {
			if (!canUsePost || !postId) {
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
			if (!canUsePost || !postId) {
				throw new DeletePostError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return deletePost({ groupId, postId });
		},
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: detailQueryKey });
			queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});

	return {
		detailQuery,
		createMutation,
		updateMutation,
		updateStatusMutation,
		deleteMutation,
	};
}

export type { UsePostParams };
export type UsePostResult = ReturnType<typeof usePost>;
export default usePost;
