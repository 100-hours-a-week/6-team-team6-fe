"use client";

import { z } from "zod";

import { createMockPost, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";
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
	errorCode?: string;

	constructor(status: number, errorCode?: string) {
		super(errorCode ?? "UNKNOWN_ERROR");
		this.name = "CreatePostError";
		this.status = status;
		this.errorCode = errorCode;
	}
}

async function createPost(params: CreatePostParams): Promise<CreatePostResponse> {
	const { groupId, title, content, rentalFee, feeUnit, newImages } = params;

	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new CreatePostError(404, "GROUP_NOT_FOUND");
		}
		const created = createMockPost({
			title,
			content,
			rentalFee,
			feeUnit,
			newImages,
		});
		return CreatePostResponseSchema.parse(created);
	}

	const formData = new FormData();
	formData.append("title", title);
	formData.append("content", content);
	formData.append("rentalFee", String(rentalFee));
	formData.append("feeUnit", feeUnit);
	formData.append(
		"imageUrls",
		JSON.stringify(newImages.map((file) => file.name)),
	);
	newImages.forEach((file) => {
		formData.append("newImages", file);
	});

	return await request(
		apiClient.post(`groups/${groupId}/posts`, { body: formData }),
		CreatePostResponseSchema,
		CreatePostError,
	);
}

export type { CreatePostParams, CreatePostResponse };
export { createPost, CreatePostError };
