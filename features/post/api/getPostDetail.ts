"use client";

import { getMockPostDetail, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";
import type { PostDetailDto } from "@/features/post/schemas";
import { PostDetailDtoSchema, PostDetailResponseApiSchema } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

type GetPostDetailParams = {
	groupId: string;
	postId: string;
};

class PostDetailError extends Error {
	status: number;
	errorCode?: string;

	constructor(status: number, errorCode?: string) {
		super(errorCode ?? "UNKNOWN_ERROR");
		this.name = "PostDetailError";
		this.status = status;
		this.errorCode = errorCode;
	}
}

async function getPostDetail(params: GetPostDetailParams): Promise<PostDetailDto> {
	const { groupId, postId } = params;

	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new PostDetailError(404, "GROUP_NOT_FOUND");
		}
		const postIdNumber = Number(postId);
		if (Number.isNaN(postIdNumber)) {
			throw new PostDetailError(404, "POST_NOT_FOUND");
		}
		const mockPost = getMockPostDetail(postIdNumber);
		if (!mockPost) {
			throw new PostDetailError(404, "POST_NOT_FOUND");
		}
		return PostDetailDtoSchema.parse(mockPost);
	}

	const data = await request(
		apiClient.get(`groups/${groupId}/posts/${postId}`),
		PostDetailResponseApiSchema,
		PostDetailError,
	);
	const { imageUrls, ...rest } = data;

	return PostDetailDtoSchema.parse({
		...rest,
		imageUrls: {
			imageInfos: imageUrls,
		},
	});
}

export type { GetPostDetailParams };
export { getPostDetail, PostDetailError };
