import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorCode, isErrorWithStatus } from "@/shared/lib/api/error-guards";
import StatusCodes from "@/shared/lib/api/status-codes";

const GROUP_MEMBERSHIP_FORBIDDEN_CODES = new Set<string>([apiErrorCodes.GROUP_NOT_MEMBER_OR_OWNER]);
const GROUP_NOT_FOUND_CODES = new Set<string>([apiErrorCodes.GROUP_NOT_FOUND]);

const isGroupMembershipForbiddenError = (error: unknown) => {
	if (!isErrorWithStatus(error, StatusCodes.FORBIDDEN)) {
		return false;
	}

	const code = getApiErrorCode(error);
	return typeof code !== "string" || GROUP_MEMBERSHIP_FORBIDDEN_CODES.has(code);
};

const isGroupNotFoundError = (error: unknown) => {
	if (!isErrorWithStatus(error, StatusCodes.NOT_FOUND)) {
		return false;
	}

	const code = getApiErrorCode(error);
	return typeof code !== "string" || GROUP_NOT_FOUND_CODES.has(code);
};

export { isGroupMembershipForbiddenError, isGroupNotFoundError };
