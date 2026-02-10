"use client";

import usePost from "@/features/post/hooks/usePost";

interface UsePostDetailQueryResult {
	post: ReturnType<typeof usePost>["detailQuery"]["data"];
	isLoading: boolean;
	isError: boolean;
	error: ReturnType<typeof usePost>["detailQuery"]["error"];
	updateStatusMutation: ReturnType<typeof usePost>["updateStatusMutation"];
	deleteMutation: ReturnType<typeof usePost>["deleteMutation"];
}

function usePostDetailQuery(groupId: string, postId: string): UsePostDetailQueryResult {
	const { detailQuery, updateStatusMutation, deleteMutation } = usePost({
		groupId,
		postId,
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
