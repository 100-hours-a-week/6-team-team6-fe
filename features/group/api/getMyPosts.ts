"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { MyPostSummariesResponseDto } from "@/features/group/schemas";
import {
	MyPostSummariesResponseApiSchema,
	MyPostSummariesResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetMyPostsParams = {
	cursor?: string;
};

class MyPostsError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("MyPostsError", status, code);
	}
}

async function getMyPosts(params: GetMyPostsParams): Promise<MyPostSummariesResponseDto> {
	const { cursor } = params;
	const searchParams = cursor ? { cursor } : undefined;

	const parsed = await requestJson(
		apiClient.get("users/me/posts", { searchParams }),
		MyPostSummariesResponseApiSchema,
		MyPostsError,
	);

	return MyPostSummariesResponseDtoSchema.parse({
		summaries: parsed.summaries.map((post) => ({
			groupId: post.groupId ?? null,
			postId: post.postId,
			postTitle: post.postTitle,
			postImageId: post.postImageId,
			postFirstImageUrl: post.postFirstImageUrl ?? null,
			updatedAt: post.updatedAt ?? null,
		})),
		nextCursor: parsed.nextCursor,
		hasNextPage: parsed.hasNextPage,
	});
}

export type { GetMyPostsParams };
export { getMyPosts, MyPostsError };
