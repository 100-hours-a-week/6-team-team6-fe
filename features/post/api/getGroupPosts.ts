"use client";

import { PostApiError } from "@/features/post/api/postApiError";
import type { PostSummariesResponseDto } from "@/features/post/schemas";
import {
	PostSummariesResponseApiSchema,
	PostSummariesResponseDtoSchema,
} from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetGroupPostsParams = {
	groupId: string;
	cursor?: string;
	query?: string;
};

class GroupPostsError extends PostApiError {
	constructor(status: number, code?: string) {
		super("GroupPostsError", status, code);
	}
}

async function getGroupPosts(params: GetGroupPostsParams): Promise<PostSummariesResponseDto> {
	const { groupId, cursor, query } = params;

	const searchParams = {
		...(cursor ? { cursor } : {}),
		...(query ? { query } : {}),
	};
	const resolvedSearchParams = Object.keys(searchParams).length > 0 ? searchParams : undefined;

	const requestOptions = resolvedSearchParams ? { searchParams: resolvedSearchParams } : undefined;

	const parsed = await requestJson(
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
