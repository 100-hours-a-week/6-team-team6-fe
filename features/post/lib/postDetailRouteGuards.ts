import { PostDetailServerError } from "@/features/post/api/getPostDetailServer";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import StatusCodes from "@/shared/lib/api/status-codes";

const POST_DETAIL_STALE_TIME_MS = 60_000;
const NOT_FOUND_ERROR_CODES = new Set<string>([
	apiErrorCodes.GROUP_NOT_FOUND,
	apiErrorCodes.POST_NOT_FOUND,
]);

const isNotFoundError = (error: unknown) =>
	error instanceof PostDetailServerError &&
	error.status === StatusCodes.NOT_FOUND &&
	typeof error.code === "string" &&
	NOT_FOUND_ERROR_CODES.has(error.code);

const isBadRequestParameterError = (error: unknown) =>
	error instanceof PostDetailServerError &&
	error.status === StatusCodes.BAD_REQUEST &&
	error.code === apiErrorCodes.PARAMETER_INVALID;

const isForbiddenError = (error: unknown) =>
	error instanceof PostDetailServerError &&
	error.status === StatusCodes.FORBIDDEN &&
	typeof error.code !== "string";

export { isBadRequestParameterError, isForbiddenError, isNotFoundError, POST_DETAIL_STALE_TIME_MS };
