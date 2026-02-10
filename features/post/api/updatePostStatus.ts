"use client";

import { z } from "zod";

import { PostApiError } from "@/features/post/api/postApiError";
import { type RentalStatus,rentalStatusSchema } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

const UpdatePostStatusResponseSchema = z.object({
	postId: z.number(),
	rentalStatus: rentalStatusSchema,
});

type UpdatePostStatusParams = {
	groupId: string;
	postId: string;
	rentalStatus: RentalStatus;
};

type UpdatePostStatusResponse = z.infer<typeof UpdatePostStatusResponseSchema>;

class UpdatePostStatusError extends PostApiError {
	constructor(status: number, code?: string) {
		super("UpdatePostStatusError", status, code);
	}
}

async function updatePostStatus(params: UpdatePostStatusParams): Promise<UpdatePostStatusResponse> {
	const { groupId, postId, rentalStatus } = params;

	return await requestJson(
		apiClient.patch(`groups/${groupId}/posts/${postId}`, {
			json: { status: rentalStatus },
		}),
		UpdatePostStatusResponseSchema,
		UpdatePostStatusError,
	);
}

export type { UpdatePostStatusParams, UpdatePostStatusResponse };
export { updatePostStatus, UpdatePostStatusError };
