import { GroupApiError } from "@/features/group/api/groupApiError";
import type { MyPostSummariesResponseDto } from "@/features/group/schemas";
import {
	MyPostSummariesResponseApiSchema,
	MyPostSummariesResponseDtoSchema,
} from "@/features/group/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

type GetMyPostsServerParams = {
	cursor?: string;
};

class MyPostsServerError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("MyPostsServerError", status, code);
	}
}

async function getMyPostsServer(
	params: GetMyPostsServerParams,
): Promise<MyPostSummariesResponseDto> {
	const { cursor } = params;
	const searchParams = cursor ? { cursor } : undefined;

	const parsed = await requestJson(
		apiServer.get("users/me/posts", {
			searchParams,
			throwHttpErrors: false,
			cache: "no-store",
		}),
		MyPostSummariesResponseApiSchema,
		MyPostsServerError,
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

export type { GetMyPostsServerParams };
export { getMyPostsServer, MyPostsServerError };
