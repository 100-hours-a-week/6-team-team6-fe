"use server";

import type { CreatePostPayload } from "@/features/post/components/PostEditor";

export async function submitPost(payload: CreatePostPayload) {
	const { title, content, rentalFee, feeUnit, newImages } = payload;

	// TODO: API 연동
	console.log("create...", {
		title,
		content,
		rentalFee,
		feeUnit,
		newImagesCount: newImages.length,
	});
}
