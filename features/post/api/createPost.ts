"use client";

import { z } from "zod";

import { PostApiError } from "@/features/post/api/postApiError";
import { uploadPostImagesWithErrorHandling } from "@/features/post/api/postImageUtils";
import type { FeeUnit } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

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

class CreatePostError extends PostApiError {
	constructor(status: number, code?: string) {
		super("CreatePostError", status, code);
	}
}

async function createPost(params: CreatePostParams): Promise<CreatePostResponse> {
	const { groupId, title, content, rentalFee, feeUnit, newImages } = params;

	const imageUrls = await uploadPostImagesWithErrorHandling(newImages, (status, code) => {
		return new CreatePostError(status, code);
	});

	const payload = {
		title,
		content,
		rentalFee,
		feeUnit,
		imageUrls,
	};

	return await requestJson(
		apiClient.post(`groups/${groupId}/posts`, { json: payload }),
		CreatePostResponseSchema,
		CreatePostError,
	);
}

export type { CreatePostParams, CreatePostResponse };
export { createPost, CreatePostError };
