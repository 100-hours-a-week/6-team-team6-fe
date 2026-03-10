"use client";

import { z } from "zod";

import { feeUnitSchema } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

const PostDraftResponseSchema = z.object({
	title: z.string(),
	content: z.string(),
	rentalFee: z.number(),
	feeUnit: feeUnitSchema,
});

type PostDraftResponse = z.infer<typeof PostDraftResponseSchema>;

type CreatePostDraftParams = {
	images: File[];
};

class CreatePostDraftError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "CreatePostDraftError";
		this.status = status;
		this.code = code;
	}
}

// NOTE: 평균 13초, 최대 17초 가량 요청이 소요되고 있어 여유있는 timeout 설정
const POST_DRAFT_API_TIMEOUT = 20000;

async function createPostDraft(params: CreatePostDraftParams): Promise<PostDraftResponse> {
	const formData = new FormData();
	params.images.forEach((file) => {
		formData.append("image", file);
	});

	return await requestJson(
		apiClient.post("ai/post-drafts", {
			body: formData,
			timeout: POST_DRAFT_API_TIMEOUT,
		}),
		PostDraftResponseSchema,
		CreatePostDraftError,
	);
}

export type { CreatePostDraftParams, PostDraftResponse };
export { createPostDraft, CreatePostDraftError };
