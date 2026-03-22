"use client";

import { PostApiError } from "@/features/post/api/postApiError";
import type { PostRecommendationsResponseDto } from "@/features/post/schemas";
import { PostRecommendationsResponseDtoSchema } from "@/features/post/schemas";

// import { PostRecommendationsResponseApiSchema } from "@/features/post/schemas";
// import { apiClient } from "@/shared/lib/api/api-client";
// import { requestJson } from "@/shared/lib/api/request";

type GetPostRecommendationsParams = {
	postId: string;
};

class PostRecommendationsError extends PostApiError {
	constructor(status: number, code?: string) {
		super("PostRecommendationsError", status, code);
	}
}

function createMockRecommendations(postId: string): PostRecommendationsResponseDto {
	const numericPostId = Number(postId);
	const basePostId = Number.isFinite(numericPostId) ? numericPostId + 1 : 1000;

	return PostRecommendationsResponseDtoSchema.parse({
		size: 4,
		recommendations: [
			{
				postId: basePostId,
				postTitle: "무선 청소기",
				postImageId: basePostId * 10,
				postFirstImageUrl: "/dummy-post-image.png",
				rentalFee: 1000,
				feeUnit: "HOUR",
				rentalStatus: "AVAILABLE",
				updatedAt: "2026-03-20T06:00:02.696Z",
				feedItemType: "BASIC",
			},
			{
				postId: basePostId + 1,
				postTitle: "캠핑 의자",
				postImageId: (basePostId + 1) * 10,
				postFirstImageUrl: "/dummy-post-image.png",
				rentalFee: 5000,
				feeUnit: "DAY",
				rentalStatus: "AVAILABLE",
				updatedAt: "2026-03-20T06:00:02.696Z",
				feedItemType: "BASIC",
			},
			{
				postId: basePostId + 2,
				postTitle: "전동 드릴",
				postImageId: (basePostId + 2) * 10,
				postFirstImageUrl: null,
				rentalFee: 3000,
				feeUnit: "DAY",
				rentalStatus: "RENTED_OUT",
				updatedAt: "2026-03-20T06:00:02.696Z",
				feedItemType: "BASIC",
			},
			{
				postId: basePostId + 3,
				postTitle: "빔 프로젝터",
				postImageId: (basePostId + 3) * 10,
				postFirstImageUrl: "/dummy-post-image.png",
				rentalFee: 2000,
				feeUnit: "HOUR",
				rentalStatus: "AVAILABLE",
				updatedAt: "2026-03-20T06:00:02.696Z",
				feedItemType: "BASIC",
			},
		],
	});
}

async function getPostRecommendations(
	params: GetPostRecommendationsParams,
): Promise<PostRecommendationsResponseDto> {
	const { postId } = params;
	/*
	 TODO: 실제 API 연동
	
	 const data = await requestJson(
	 	apiClient.get(`posts/${postId}/recommendations`),
	 	PostRecommendationsResponseApiSchema,
	 	PostRecommendationsError,
	 );
	
	 return PostRecommendationsResponseDtoSchema.parse({
	 	size: data.size,
	 	recommendations: data.recommendations,
	 });
	 */

	return createMockRecommendations(postId);
}

export type { GetPostRecommendationsParams };
export { getPostRecommendations, PostRecommendationsError };
