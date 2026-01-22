/* eslint-disable @typescript-eslint/no-empty-object-type */
"use server";

import type { EditPostPayload } from "@/features/post/components/PostEditor";

interface SubmitPostParams extends EditPostPayload {}
export async function submitPost(props: SubmitPostParams) {
	const { title, content, rentalFee, feeUnit, postId, keepImageIds, newImages } = props;

	// TODO: API 연동
	console.log("save...", {
		title,
		content,
		rentalFee,
		feeUnit,
		postId,
		keepImageIds,
		newImagesCount: newImages.length,
	});

	return;
}
