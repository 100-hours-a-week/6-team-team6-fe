"use client";

import { z } from "zod";

import type { FeeUnit } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

const CreatePostResponseSchema = z.object({
	postId: z.number(),
});

type CreatePostResponse = z.infer<typeof CreatePostResponseSchema>;

type CreatePostParams = {
	groupId: string;
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
	newImages: File[];
};

class CreatePostError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "CreatePostError";
		this.status = status;
		this.code = code;
	}
}

async function createPost(params: CreatePostParams): Promise<CreatePostResponse> {
	const { groupId, title, content, rentalFee, feeUnit, newImages } = params;

	const payload = {
		title,
		content,
		rentalFee,
		feeUnit,
		// TODO: fix to real image urls
		imageUrls: ["/dummy-post-image.png"],
	};

	return await request(
		apiClient.post(`groups/${groupId}/posts`, { json: payload }),
		CreatePostResponseSchema,
		CreatePostError,
	);
}

export type { CreatePostParams, CreatePostResponse };
export { createPost, CreatePostError };
