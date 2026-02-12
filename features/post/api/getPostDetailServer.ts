import { PostApiError } from "@/features/post/api/postApiError";
import type { PostDetailDto } from "@/features/post/schemas";
import { PostDetailDtoSchema, PostDetailResponseApiSchema } from "@/features/post/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

type GetPostDetailServerParams = {
	groupId: string;
	postId: string;
};

class PostDetailServerError extends PostApiError {
	constructor(status: number, code?: string) {
		super("PostDetailServerError", status, code);
	}
}

async function getPostDetailServer(params: GetPostDetailServerParams): Promise<PostDetailDto> {
	const { groupId, postId } = params;

	const data = await requestJson(
		apiServer.get(`groups/${groupId}/posts/${postId}`, {
			throwHttpErrors: false,
		}),
		PostDetailResponseApiSchema,
		PostDetailServerError,
	);
	const { imageUrls, ...rest } = data;

	return PostDetailDtoSchema.parse({
		...rest,
		imageUrls,
	});
}

export type { GetPostDetailServerParams };
export { getPostDetailServer, PostDetailServerError };
