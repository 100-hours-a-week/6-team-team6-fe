"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { requestText } from "@/shared/lib/api/request";
import StatusCodes from "@/shared/lib/api/status-codes";

type UploadGroupImageParams = {
	file: File;
};

class UploadGroupImageError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("UploadGroupImageError", status, code);
	}
}

async function uploadGroupImage(params: UploadGroupImageParams): Promise<string> {
	const formData = new FormData();
	formData.append("image", params.file);

	try {
		return await requestText(
			apiClient.post("images", { body: formData }),
			UploadGroupImageError,
		);
	} catch (error) {
		if (error instanceof UploadGroupImageError && !error.code) {
			if (error.status === StatusCodes.REQUEST_ENTITY_TOO_LARGE) {
				error.code = apiErrorCodes.IMAGE_TOO_LARGE;
			} else if (error.status === StatusCodes.UNSUPPORTED_MEDIA_TYPE) {
				error.code = apiErrorCodes.IMAGE_UNSUPPORTED_TYPE;
			}
		}
		throw error;
	}
}

export type { UploadGroupImageParams };
export { uploadGroupImage, UploadGroupImageError };
