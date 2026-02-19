const ROOT_RELATIVE_PREFIX = "/";
const RELATIVE_PREFIX_PATTERN = /^\.?\//;

export const isDirectPreviewImageSrc = (imageSrc: string) =>
	imageSrc.startsWith("blob:") || imageSrc.startsWith("data:");

export const normalizeImageSrcForNextImage = (imageSrc?: string | null) => {
	if (!imageSrc) {
		return null;
	}

	const trimmedImageSrc = imageSrc.trim();
	if (!trimmedImageSrc) {
		return null;
	}

	if (
		trimmedImageSrc.startsWith(ROOT_RELATIVE_PREFIX) ||
		trimmedImageSrc.startsWith("http://") ||
		trimmedImageSrc.startsWith("https://") ||
		isDirectPreviewImageSrc(trimmedImageSrc)
	) {
		return trimmedImageSrc;
	}

	return `${ROOT_RELATIVE_PREFIX}${trimmedImageSrc.replace(RELATIVE_PREFIX_PATTERN, "")}`;
};
