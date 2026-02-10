"use client";

import { PostApiError } from "@/features/post/api/postApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { requestVoid } from "@/shared/lib/api/request";

type DeletePostParams = {
	groupId: string;
	postId: string;
};

class DeletePostError extends PostApiError {
	constructor(status: number, code?: string) {
		super("DeletePostError", status, code);
	}
}

async function deletePost(params: DeletePostParams): Promise<void> {
	const { groupId, postId } = params;

	await requestVoid(apiClient.delete(`groups/${groupId}/posts/${postId}`), DeletePostError);
}

export type { DeletePostParams };
export { deletePost, DeletePostError };
