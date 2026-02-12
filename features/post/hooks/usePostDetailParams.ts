"use client";

import { useParams } from "next/navigation";

interface UsePostDetailParamsResult {
	normalizedGroupId: string;
	normalizedPostId: string;
	postIdNumber: number;
}

function usePostDetailParams(): UsePostDetailParamsResult {
	const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
	const normalizedGroupId = groupId ?? "";
	const normalizedPostId = postId ?? "";
	const postIdNumber = Number(postId);

	return {
		normalizedGroupId,
		normalizedPostId,
		postIdNumber,
	};
}

export { usePostDetailParams };
export type { UsePostDetailParamsResult };
