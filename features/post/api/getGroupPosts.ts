"use client";

import { getMockPostSummariesPage, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";
import type { PostSummariesResponseDto } from "@/features/post/schemas";
import {
	PostSummariesResponseApiSchema,
	PostSummariesResponseDtoSchema,
} from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

type GetGroupPostsParams = {
	groupId: string;
	cursor?: string;
};

class GroupPostsError extends Error {
	status: number;
	errorCode?: string;

	constructor(status: number, errorCode?: string) {
		super(errorCode ?? "UNKNOWN_ERROR");
		this.name = "GroupPostsError";
		this.status = status;
		this.errorCode = errorCode;
	}
}

async function getGroupPosts(params: GetGroupPostsParams): Promise<PostSummariesResponseDto> {
	const { groupId, cursor } = params;
	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new GroupPostsError(404, "GROUP_NOT_FOUND");
		}
		const mockResult = getMockPostSummariesPage(cursor);
		return PostSummariesResponseDtoSchema.parse(mockResult);
	}

	const searchParams = cursor ? { cursor } : undefined;

	const parsed = await request(
		apiClient.get(`groups/${groupId}/posts`, { searchParams }),
		PostSummariesResponseApiSchema,
		GroupPostsError,
	);

	return PostSummariesResponseDtoSchema.parse({
		summaries: parsed.postSummaries,
		nextCursor: parsed.nextCursor,
		hasNextPage: parsed.hasNext,
	});
}

export type { GetGroupPostsParams };
export { getGroupPosts, GroupPostsError };
