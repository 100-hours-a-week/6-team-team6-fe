"use client";

import { deleteMockPost, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { requestVoid } from "@/shared/lib/api/request";

type DeletePostParams = {
	groupId: string;
	postId: string;
};

class DeletePostError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "DeletePostError";
		this.status = status;
		this.code = code;
	}
}

async function deletePost(params: DeletePostParams): Promise<void> {
	const { groupId, postId } = params;

	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new DeletePostError(404, apiErrorCodes.GROUP_NOT_FOUND);
		}
		const postIdNumber = Number(postId);
		if (Number.isNaN(postIdNumber)) {
			throw new DeletePostError(404, apiErrorCodes.POST_NOT_FOUND);
		}
		const deleted = deleteMockPost(postIdNumber);
		if (!deleted) {
			throw new DeletePostError(404, apiErrorCodes.POST_NOT_FOUND);
		}
		return;
	}

	await requestVoid(apiClient.delete(`groups/${groupId}/posts/${postId}`), DeletePostError);
}

export type { DeletePostParams };
export { deletePost, DeletePostError };
