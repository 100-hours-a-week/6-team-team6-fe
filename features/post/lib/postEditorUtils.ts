import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

export interface ExistingImage {
	id: string;
	url: string;
}

export const mockExistingImages: ExistingImage[] = [
	{ id: "mock-1", url: "/dummy-post-image.png" },
	{ id: "mock-2", url: "/default-profile.png" },
	{ id: "mock-3", url: "/dummy-post-image.png" },
];

export const AI_DRAFT_ERROR_MESSAGE = "AI 자동 작성에 실패했습니다.";
export const IMAGE_FETCH_ERROR_CODE = "IMAGE_FETCH_FAILED";
export const IMAGE_COMPRESS_WARNING_MESSAGE =
	"일부 이미지를 압축하지 못했습니다. 원본으로 업로드합니다.";
export const IMAGE_UPLOAD_PARTIAL_SIZE_EXCEEDED_MESSAGE =
	"이미지 용량이 커서 일부 파일이 업로드되지 않았습니다.";
export const MAX_UPLOAD_IMAGE_SIZE_MB = 5;
export const MAX_UPLOAD_IMAGE_SIZE_BYTES = MAX_UPLOAD_IMAGE_SIZE_MB * 1024 * 1024;
export const IMAGE_TOO_LARGE_MESSAGE =
	getApiErrorMessage(apiErrorCodes.IMAGE_TOO_LARGE) ??
	`이미지 용량이 ${MAX_UPLOAD_IMAGE_SIZE_MB}MB를 초과합니다.`;

const getFileNameFromUrl = (url: string, fallback: string) => {
	try {
		const parsed = new URL(url, window.location.origin);
		const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();
		return lastSegment ?? fallback;
	} catch {
		return fallback;
	}
};

const withExtension = (fileName: string, mimeType: string) => {
	if (fileName.includes(".")) {
		return fileName;
	}
	const extension = mimeType.split("/")[1];
	if (!extension) {
		return fileName;
	}
	return `${fileName}.${extension}`;
};

export const createFileFromUrl = async (url: string, fallbackName: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(IMAGE_FETCH_ERROR_CODE);
	}
	const blob = await response.blob();
	const mimeType = blob.type || "application/octet-stream";
	const fileName = withExtension(getFileNameFromUrl(url, fallbackName), mimeType);
	return new File([blob], fileName, { type: mimeType });
};
