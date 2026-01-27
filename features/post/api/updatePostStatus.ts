"use client";

import { z } from "zod";

import { updateMockPostStatus, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

const rentalStatusSchema = z.enum(["AVAILABLE", "RENTED_OUT"]);

const UpdatePostStatusResponseSchema = z.object({
	postId: z.number(),
	status: rentalStatusSchema,
});

type UpdatePostStatusParams = {
	groupId: string;
	postId: string;
	status: z.infer<typeof rentalStatusSchema>;
};

type UpdatePostStatusResponse = z.infer<typeof UpdatePostStatusResponseSchema>;

class UpdatePostStatusError extends Error {
	status: number;
	errorCode?: string;

	constructor(status: number, errorCode?: string) {
		super(errorCode ?? "UNKNOWN_ERROR");
		this.name = "UpdatePostStatusError";
		this.status = status;
		this.errorCode = errorCode;
	}
}

async function updatePostStatus(params: UpdatePostStatusParams): Promise<UpdatePostStatusResponse> {
	const { groupId, postId, status } = params;

	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new UpdatePostStatusError(404, "GROUP_NOT_FOUND");
		}
		const postIdNumber = Number(postId);
		if (Number.isNaN(postIdNumber)) {
			throw new UpdatePostStatusError(404, "POST_NOT_FOUND");
		}
		const updated = updateMockPostStatus(postIdNumber, status);
		if (!updated) {
			throw new UpdatePostStatusError(404, "POST_NOT_FOUND");
		}
		return UpdatePostStatusResponseSchema.parse(updated);
	}

	return await request(
		apiClient.patch(`groups/${groupId}/posts/${postId}`, {
			json: { status },
		}),
		UpdatePostStatusResponseSchema,
		UpdatePostStatusError,
	);
}

export type { UpdatePostStatusParams, UpdatePostStatusResponse };
export { rentalStatusSchema, updatePostStatus, UpdatePostStatusError };
