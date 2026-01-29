"use client";

import { z } from "zod";

import { updateMockPost, USE_POST_MOCKS } from "@/features/post/lib/mock-posts";
import type { FeeUnit } from "@/features/post/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
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

	if (USE_POST_MOCKS) {
		if (!groupId) {
			throw new UpdatePostError(404, apiErrorCodes.GROUP_NOT_FOUND);
		}
		const postIdNumber = Number(postId);
		if (Number.isNaN(postIdNumber)) {
			throw new UpdatePostError(404, apiErrorCodes.POST_NOT_FOUND);
		}
		const updated = updateMockPost({
			postId: postIdNumber,
			title,
			content,
			rentalFee,
			feeUnit,
			imageUrls,
			newImages,
		});
		if (!updated) {
			throw new UpdatePostError(404, apiErrorCodes.POST_NOT_FOUND);
		}
		return UpdatePostResponseSchema.parse(updated);
	}

	const formData = new FormData();
	formData.append("title", title);
	formData.append("content", content);
	formData.append("rentalFee", String(rentalFee));
	formData.append("feeUnit", feeUnit);
	formData.append("imageUrls", JSON.stringify(imageUrls));
	newImages.forEach((file) => {
		formData.append("newImages", file);
	});

	return await request(
		apiClient.put(`groups/${groupId}/posts/${postId}`, {
			body: formData,
		}),
		UpdatePostResponseSchema,
		UpdatePostError,
	);
}

export type { UpdatePostImageInfo, UpdatePostParams, UpdatePostResponse };
export { updatePost, UpdatePostError };
