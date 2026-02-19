import { type ApiErrorCode, apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { authErrorMessages, authValidationMessages } from "@/shared/lib/error-messages";

export const apiErrorMessageMap: Record<ApiErrorCode, string> = {
	[apiErrorCodes.AUTH_INVALID_CREDENTIALS]: authErrorMessages.loginFailed,
	[apiErrorCodes.AUTH_MISSING_TOKEN]: "인증 토큰이 요청에 없습니다.",
	[apiErrorCodes.TOKEN_INVALID_ACCESS]: "액세스 토큰이 유효하지 않습니다.",
	[apiErrorCodes.TOKEN_INVALID_REFRESH]: "리프레시 토큰이 유효하지 않습니다.",
	[apiErrorCodes.TOKEN_EXPIRED_REFRESH]: "리프레시 토큰이 만료되었습니다.",
	[apiErrorCodes.USER_NOT_FOUND]: "사용자를 찾을 수 없습니다.",
	[apiErrorCodes.USER_INVALID_LOGIN_ID]: authValidationMessages.loginIdInvalid,
	[apiErrorCodes.USER_INVALID_NICKNAME]: "닉네임 형식이 올바르지 않습니다.",
	[apiErrorCodes.USER_DUPLICATE_LOGIN_ID]: authErrorMessages.signupExistingId,
	[apiErrorCodes.GROUP_NOT_FOUND]: "그룹을 찾을 수 없습니다.",
	[apiErrorCodes.GROUP_NOT_MEMBER_OR_OWNER]: "그룹 멤버가 아니거나 소유자가 아닙니다.",
	[apiErrorCodes.GROUP_INVALID_NAME]: "그룹 이름 형식이 올바르지 않습니다.",
	[apiErrorCodes.GROUP_LIMIT_REACHED]: "그룹 한도를 초과했습니다.",
	[apiErrorCodes.POST_NOT_FOUND]: "게시글을 찾을 수 없습니다.",
	[apiErrorCodes.POST_NOT_OWNER]: "게시글 소유자가 아닙니다.",
	[apiErrorCodes.CHAT_SELF_NOT_ALLOWED]: "자기 자신과의 채팅은 불가합니다.",
	[apiErrorCodes.IMAGE_EMPTY]: "이미지를 첨부해 주세요.",
	[apiErrorCodes.IMAGE_UNSUPPORTED_TYPE]: "허용되지 않는 이미지 형식입니다.",
	[apiErrorCodes.IMAGE_TOO_LARGE]: "이미지 용량이 5MB를 초과합니다.",
	[apiErrorCodes.IMAGE_NOT_FOUND]: "이미지를 찾을 수 없습니다.",
	[apiErrorCodes.CURSOR_INVALID]: "잘못된 커서입니다.",
	[apiErrorCodes.SERVER_ERROR]: "서버 오류가 발생했습니다. 다시 시도해 주세요.",
	[apiErrorCodes.PARAMETER_INVALID]: "요청 파라미터 검증에 실패했습니다.",
};

export function getApiErrorMessage(code?: string | null) {
	if (!code) {
		return null;
	}
	return apiErrorMessageMap[code as ApiErrorCode] ?? null;
}
