"use client";

import { z } from "zod";

import { PostApiError } from "@/features/post/api/postApiError";
import { uploadPostImagesWithErrorHandling } from "@/features/post/api/postImageUtils";
import type { FeeUnit } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

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

class UpdatePostError extends PostApiError {
	constructor(status: number, code?: string) {
		super("UpdatePostError", status, code);
	}
}

async function updatePost(params: UpdatePostParams): Promise<UpdatePostResponse> {
	const { groupId, postId, title, content, rentalFee, feeUnit, imageUrls, newImages } = params;

	const uploadedImageUrls = await uploadPostImagesWithErrorHandling(newImages, (status, code) => {
		return new UpdatePostError(status, code);
	});

	const nextImageUrls: UpdatePostImageInfo[] = [
		...imageUrls,
		...uploadedImageUrls.map((imageUrl) => ({ postImageId: null, imageUrl })),
	];
	const payload = {
		title,
		content,
		rentalFee,
		feeUnit,
		imageUrls: nextImageUrls,
	};

	return await requestJson(
		apiClient.put(`groups/${groupId}/posts/${postId}`, {
			json: payload,
		}),
		UpdatePostResponseSchema,
		UpdatePostError,
	);
}

export type { UpdatePostImageInfo, UpdatePostParams, UpdatePostResponse };
export { updatePost, UpdatePostError };
