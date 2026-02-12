import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorCode, isErrorWithStatus } from "@/shared/lib/api/error-guards";
import StatusCodes from "@/shared/lib/api/status-codes";

const POST_DETAIL_STALE_TIME_MS = 60_000;
const NOT_FOUND_ERROR_CODES = new Set<string>([
	apiErrorCodes.GROUP_NOT_FOUND,
	apiErrorCodes.POST_NOT_FOUND,
]);
const DETAIL_FORBIDDEN_ERROR_CODES = new Set<string>([apiErrorCodes.GROUP_NOT_MEMBER_OR_OWNER]);
const EDIT_FORBIDDEN_ERROR_CODES = new Set<string>([
	apiErrorCodes.GROUP_NOT_MEMBER_OR_OWNER,
	apiErrorCodes.POST_NOT_OWNER,
]);

const isNotFoundError = (error: unknown) => {
	if (!isErrorWithStatus(error, StatusCodes.NOT_FOUND)) {
		return false;
	}

	const code = getApiErrorCode(error);
	return typeof code === "string" && NOT_FOUND_ERROR_CODES.has(code);
};

const isBadRequestParameterError = (error: unknown) =>
	isErrorWithStatus(error, StatusCodes.BAD_REQUEST) &&
	getApiErrorCode(error) === apiErrorCodes.PARAMETER_INVALID;

const isForbiddenError = (error: unknown) => {
	if (!isErrorWithStatus(error, StatusCodes.FORBIDDEN)) {
		return false;
	}

	const code = getApiErrorCode(error);
	return typeof code !== "string" || DETAIL_FORBIDDEN_ERROR_CODES.has(code);
};

const isEditForbiddenError = (error: unknown) => {
	if (!isErrorWithStatus(error, StatusCodes.FORBIDDEN)) {
		return false;
	}

	const code = getApiErrorCode(error);
	return typeof code !== "string" || EDIT_FORBIDDEN_ERROR_CODES.has(code);
};

export {
	isBadRequestParameterError,
	isEditForbiddenError,
	isForbiddenError,
	isNotFoundError,
	POST_DETAIL_STALE_TIME_MS,
};
