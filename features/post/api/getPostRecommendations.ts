"use client";

import { PostApiError } from "@/features/post/api/postApiError";
import type { PostRecommendationsResponseDto } from "@/features/post/schemas";
import {
	PostRecommendationsResponseApiSchema,
	PostRecommendationsResponseDtoSchema,
} from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetPostRecommendationsParams = {
	postId: string;
};

class PostRecommendationsError extends PostApiError {
	constructor(status: number, code?: string) {
		super("PostRecommendationsError", status, code);
	}
}

async function getPostRecommendations(
	params: GetPostRecommendationsParams,
): Promise<PostRecommendationsResponseDto> {
	const { postId } = params;

	const data = await requestJson(
		apiClient.get(`posts/${postId}/recommendations`),
		PostRecommendationsResponseApiSchema,
		PostRecommendationsError,
	);

	return PostRecommendationsResponseDtoSchema.parse({
		size: data.size,
		recommendations: data.recommendations,
	});
}

export type { GetPostRecommendationsParams };
export { getPostRecommendations, PostRecommendationsError };
