"use client";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { requestText } from "@/shared/lib/api/request";
import StatusCodes from "@/shared/lib/api/status-codes";

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

	try {
		return await requestText(apiClient.post("images", { body: formData }), UploadPostImageError);
	} catch (error) {
		if (error instanceof UploadPostImageError && !error.code) {
			if (error.status === StatusCodes.REQUEST_ENTITY_TOO_LARGE) {
				error.code = apiErrorCodes.IMAGE_TOO_LARGE;
			} else if (error.status === StatusCodes.UNSUPPORTED_MEDIA_TYPE) {
				error.code = apiErrorCodes.IMAGE_UNSUPPORTED_TYPE;
			}
		}
		throw error;
	}
}

async function uploadPostImages(files: File[]): Promise<string[]> {
	if (files.length === 0) {
		return [];
	}

	return await Promise.all(files.map((file) => uploadPostImage({ file })));
}

export type { UploadPostImageParams };
export { uploadPostImage, UploadPostImageError, uploadPostImages };
