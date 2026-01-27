import { type ApiErrorCode, apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { authErrorMessages, authValidationMessages } from "@/shared/lib/error-messages";

export const apiErrorMessageMap: Record<ApiErrorCode, string> = {
	[apiErrorCodes.AUTH_FAILED]: "인증이 필요합니다.",
	[apiErrorCodes.INVALID_AUTH_HEADER_TYPE]: "잘못된 인증 헤더입니다.",
	[apiErrorCodes.INVALID_REQUEST_INPUT]: "잘못된 요청입니다.",
	[apiErrorCodes.INTERNAL_SERVER_ERROR]: "서버 오류가 발생했습니다. 다시 시도해 주세요.",
	[apiErrorCodes.INVALID_LOGIN_ID_INPUT]: authValidationMessages.loginIdInvalid,
	[apiErrorCodes.INVALID_PASSWORD_INPUT]: authValidationMessages.passwordInvalid,
	[apiErrorCodes.LOGIN_FAILED]: authErrorMessages.loginFailed,
	[apiErrorCodes.EXSTING_ID]: authErrorMessages.signupExistingId,
	[apiErrorCodes.INVALID_REFRESH_TOKEN]: "리프레시 토큰이 유효하지 않습니다.",
	[apiErrorCodes.EXPIRED_REFRESH_TOKEN]: "리프레시 토큰이 만료되었습니다.",
	[apiErrorCodes.REVOKED_REFRESH_TOKEN]: "리프레시 토큰이 폐기되었습니다.",
	[apiErrorCodes.CSRF_TOKEN_MISSING]: "CSRF 토큰이 누락되었습니다.",
	[apiErrorCodes.INVALID_CSRF_TOKEN]: "CSRF 토큰이 유효하지 않습니다.",
	[apiErrorCodes.EXPIRED_CSRF_TOKEN]: "CSRF 토큰이 만료되었습니다.",
	[apiErrorCodes.GROUP_NOT_FOUND]: "그룹을 찾을 수 없습니다.",
	[apiErrorCodes.IS_NOT_MEMBERSHIP]: "그룹 멤버가 아닙니다.",
	[apiErrorCodes.GROUP_LIMIT_REACHED]: "가입 가능한 그룹 수를 초과했습니다.",
	[apiErrorCodes.INVALID_GROUP_NAME]: "그룹 이름 형식이 올바르지 않습니다.",
	[apiErrorCodes.INVALID_NICKNAME]: "닉네임 형식이 올바르지 않습니다.",
	[apiErrorCodes.IS_ALREADY_MEMBERSHIP]: "이미 그룹 멤버입니다.",
	[apiErrorCodes.KEYWORD_SUBSCRIPTION_NOT_FOUND]: "키워드 알림을 찾을 수 없습니다.",
	[apiErrorCodes.FORBIDDEN_WORD]: "금칙어가 포함되어 있습니다.",
	[apiErrorCodes.INVALID_SEARCH_KEYWORD]: "허용되지 않는 검색어입니다.",
	[apiErrorCodes.INVALID_CURSOR]: "잘못된 커서입니다.",
	[apiErrorCodes.POST_NOT_FOUND]: "게시글을 찾을 수 없습니다.",
	[apiErrorCodes.CHATROOM_NOT_FOUND]: "채팅방을 찾을 수 없습니다.",
	[apiErrorCodes.IS_NOT_PARTICIPANT]: "채팅 참여자가 아닙니다.",
	[apiErrorCodes.IS_NOT_SELLER]: "판매자가 아닙니다.",
	[apiErrorCodes.NOTIFICATION_NOT_FOUND]: "알림을 찾을 수 없습니다.",
	[apiErrorCodes.IMAGE_NOT_FOUND]: "이미지 URL이 유효하지 않습니다.",
	[apiErrorCodes.INVALID_INPUT]: "잘못된 입력입니다.",
	[apiErrorCodes.IMAGE_OVER_5MB]: "이미지 용량이 5MB를 초과합니다.",
	[apiErrorCodes.NOT_SUPPOSED_EXTENSION]: "허용되지 않는 이미지 형식입니다.",
	[apiErrorCodes.EMPYT_IMAGE]: "이미지를 첨부해 주세요.",
	[apiErrorCodes.IMAGE_UPLOAD_FAILED]: "이미지 업로드에 실패했습니다.",
};

export function getApiErrorMessage(code?: string | null) {
	if (!code) {
		return null;
	}
	return apiErrorMessageMap[code as ApiErrorCode] ?? null;
}
