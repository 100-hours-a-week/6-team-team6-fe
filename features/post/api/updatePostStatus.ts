"use client";

import { z } from "zod";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

const rentalStatusSchema = z.enum(["AVAILABLE", "RENTED_OUT"]);

const UpdatePostStatusResponseSchema = z.object({
	postId: z.number(),
	rentalStatus: rentalStatusSchema,
});

type UpdatePostStatusParams = {
	groupId: string;
	postId: string;
	rentalStatus: z.infer<typeof rentalStatusSchema>;
};

type UpdatePostStatusResponse = z.infer<typeof UpdatePostStatusResponseSchema>;

class UpdatePostStatusError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "UpdatePostStatusError";
		this.status = status;
		this.code = code;
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
export { rentalStatusSchema, updatePostStatus, UpdatePostStatusError };
