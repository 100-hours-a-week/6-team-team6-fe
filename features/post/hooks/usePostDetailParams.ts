"use client";

import { useParams } from "next/navigation";

interface UsePostDetailParamsResult {
	normalizedGroupId: string;
	normalizedPostId: string;
	postIdNumber: number;
	shouldNotFound: boolean;
}

function usePostDetailParams(): UsePostDetailParamsResult {
	const { groupId, postId } = useParams<{ groupId: string; postId: string }>();
	const normalizedGroupId = groupId ?? "";
	const normalizedPostId = postId ?? "";
	const postIdNumber = Number(postId);

	const shouldNotFound = Number.isNaN(postIdNumber);

	return {
		normalizedGroupId,
		normalizedPostId,
		postIdNumber,
		shouldNotFound,
	};
}

export { usePostDetailParams };
export type { UsePostDetailParamsResult };
