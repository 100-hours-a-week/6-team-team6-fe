"use client";

import { PostApiError } from "@/features/post/api/postApiError";
import type { PostDetailDto } from "@/features/post/schemas";
import { PostDetailDtoSchema, PostDetailResponseApiSchema } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetPostDetailParams = {
	groupId: string;
	postId: string;
};

class PostDetailError extends PostApiError {
	constructor(status: number, code?: string) {
		super("PostDetailError", status, code);
	}
}

async function getPostDetail(params: GetPostDetailParams): Promise<PostDetailDto> {
	const { groupId, postId } = params;

	const data = await requestJson(
		apiClient.get(`groups/${groupId}/posts/${postId}`),
		PostDetailResponseApiSchema,
		PostDetailError,
	);
	const { imageUrls, ...rest } = data;

	return PostDetailDtoSchema.parse({
		...rest,
		imageUrls,
	});
}

export type { GetPostDetailParams };
export { getPostDetail, PostDetailError };
