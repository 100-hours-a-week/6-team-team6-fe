"use client";

import { UploadPostImageError, uploadPostImages } from "@/features/post/api/uploadPostImage";

type PostImageErrorFactory = (status: number, code?: string) => Error;

async function uploadPostImagesWithErrorHandling(
	files: File[],
	createError: PostImageErrorFactory,
): Promise<string[]> {
	try {
		return await uploadPostImages(files);
	} catch (error) {
		if (error instanceof UploadPostImageError) {
			throw createError(error.status, error.code);
		}
		throw error;
	}
}

export { uploadPostImagesWithErrorHandling };
