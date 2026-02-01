"use client";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestText } from "@/shared/lib/api/request";

type UploadPostImageParams = {
	file: File;
};

class UploadPostImageError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "UploadPostImageError";
		this.status = status;
		this.code = code;
	}
}

async function uploadPostImage(params: UploadPostImageParams): Promise<string> {
	const formData = new FormData();
	formData.append("image", params.file);

	return await requestText(apiClient.post("images", { body: formData }), UploadPostImageError);
}

async function uploadPostImages(files: File[]): Promise<string[]> {
	if (files.length === 0) {
		return [];
	}

	return await Promise.all(files.map((file) => uploadPostImage({ file })));
}

export type { UploadPostImageParams };
export { uploadPostImage, UploadPostImageError,uploadPostImages };
