"use client";

import { z } from "zod";

import type { FeeUnit } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

const UpdatePostResponseSchema = z.object({
	postId: z.number(),
});

type UpdatePostResponse = z.infer<typeof UpdatePostResponseSchema>;

type UpdatePostImageInfo = {
	postImageId: number | null;
	imageUrl: string;
};

type UpdatePostParams = {
	groupId: string;
	postId: string;
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
	imageUrls: UpdatePostImageInfo[];
	newImages: File[];
};

class UpdatePostError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "UpdatePostError";
		this.status = status;
		this.code = code;
	}
}

async function updatePost(params: UpdatePostParams): Promise<UpdatePostResponse> {
	const { groupId, postId, title, content, rentalFee, feeUnit, imageUrls, newImages } = params;

	// const normalizedImageUrls = [
	// 	...imageUrls,
	// 	...newImages.map((file) => ({ postImageId: null, imageUrl: file.name })),
	// ];
	const payload = {
		title,
		content,
		rentalFee,
		feeUnit,
		imageUrls: ["/dummy-post-image.png"],
		// imageUrls: normalizedImageUrls,
		// TODO: fix this
	};

	return await request(
		apiClient.put(`groups/${groupId}/posts/${postId}`, {
			json: payload,
		}),
		UpdatePostResponseSchema,
		UpdatePostError,
	);
}

export type { UpdatePostImageInfo, UpdatePostParams, UpdatePostResponse };
export { updatePost, UpdatePostError };
