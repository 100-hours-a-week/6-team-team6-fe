"use client";

import { getMockPostSummariesPage, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";
import type { PostSummariesResponseDto } from "@/features/post/schemas";
import {
	PostSummariesResponseApiSchema,
	PostSummariesResponseDtoSchema,
} from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { request } from "@/shared/lib/api/request";

type GetGroupPostsParams = {
	groupId: string;
	cursor?: string;
	query?: string;
};

class GroupPostsError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GroupPostsError";
		this.status = status;
		this.code = code;
	}
}

async function getGroupPosts(params: GetGroupPostsParams): Promise<PostSummariesResponseDto> {
	const { groupId, cursor, query } = params;
	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new GroupPostsError(404, apiErrorCodes.GROUP_NOT_FOUND);
		}
		const mockResult = getMockPostSummariesPage(cursor);
		return PostSummariesResponseDtoSchema.parse(mockResult);
	}

	const searchParams = {
		...(cursor ? { cursor } : {}),
		...(query ? { query } : {}),
	};
	const resolvedSearchParams =
		Object.keys(searchParams).length > 0 ? searchParams : undefined;

	const requestOptions = resolvedSearchParams ? { searchParams: resolvedSearchParams } : undefined;

	const parsed = await request(
		apiClient.get(`groups/${groupId}/posts`, requestOptions),
		PostSummariesResponseApiSchema,
		GroupPostsError,
	);

	return PostSummariesResponseDtoSchema.parse({
		summaries: parsed.summaries,
		nextCursor: parsed.nextCursor,
		hasNextPage: parsed.hasNextPage,
	});
}

export type { GetGroupPostsParams };
export { getGroupPosts, GroupPostsError };
