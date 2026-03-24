"use client";

import { PostApiError } from "@/features/post/api/postApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

type CheckPostContentParams = {
	imageUrls: string[];
	title: string;
	content: string;
};

class CheckPostContentError extends PostApiError {
	constructor(status: number, code?: string) {
		super("CheckPostContentError", status, code);
	}
}

async function checkPostContent(params: CheckPostContentParams): Promise<void> {
	await requestVoid(
		apiClient.post("posts/content-checks", {
			json: params,
		}),
		CheckPostContentError,
	);
}

export type { CheckPostContentParams };
export { checkPostContent, CheckPostContentError };
