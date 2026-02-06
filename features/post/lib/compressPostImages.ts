import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 1.5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_DIMENSION = 1600;
const INITIAL_QUALITY = 0.8;
const UNSUPPORTED_TYPES = new Set(["image/gif", "image/svg+xml", "image/heic", "image/heif"]);

const shouldSkipCompression = (file: File) => {
	if (file.size <= MAX_SIZE_BYTES) {
		return true;
	}
	if (!file.type) {
		return true;
	}
	return UNSUPPORTED_TYPES.has(file.type);
};

const wrapWithOriginalMetadata = (blob: Blob, original: File) =>
	new File([blob], original.name, {
		type: blob.type || original.type,
		lastModified: original.lastModified,
	});

export async function compressPostImage(file: File): Promise<File> {
	if (shouldSkipCompression(file)) {
		return file;
	}

	const compressed = await imageCompression(file, {
		maxSizeMB: MAX_SIZE_MB,
		maxWidthOrHeight: MAX_DIMENSION,
		initialQuality: INITIAL_QUALITY,
		useWebWorker: true,
		fileType: file.type,
	});

	return wrapWithOriginalMetadata(compressed, file);
}
