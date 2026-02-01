"use client";

import { z } from "zod";

import { UploadPostImageError, uploadPostImages } from "@/features/post/api/uploadPostImage";
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

	let imageUrls: string[] = [];

	try {
		imageUrls = await uploadPostImages(newImages);
	} catch (error) {
		if (error instanceof UploadPostImageError) {
			throw new CreatePostError(error.status, error.code);
		}
		throw error;
	}

	const payload = {
		title,
		content,
		rentalFee,
		feeUnit,
		imageUrls,
	};

	return await request(
		apiClient.post(`groups/${groupId}/posts`, { json: payload }),
		CreatePostResponseSchema,
		CreatePostError,
	);
}

export type { CreatePostParams, CreatePostResponse };
export { createPost, CreatePostError };
