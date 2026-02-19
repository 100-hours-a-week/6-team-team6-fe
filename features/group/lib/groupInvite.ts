const GROUP_INVITE_NICKNAME_MIN_LENGTH = 2;
const GROUP_INVITE_NICKNAME_MAX_LENGTH = 12;
const GROUP_INVITE_NICKNAME_LENGTH_ERROR = `닉네임은 최소 ${GROUP_INVITE_NICKNAME_MIN_LENGTH}자, 최대 ${GROUP_INVITE_NICKNAME_MAX_LENGTH}자로 입력해주세요`;

const GROUP_INVITE_ERROR_CODES = {
	alreadyMembership: "IS_ALREADY_MEMBERSHIP",
	groupLimitReached: "GROUP_LIMIT_REACHED",
	groupNotFound: "GROUP_NOT_FOUND",
	invalidNickname: "INVALID_NICKNAME",
} as const;

const GROUP_INVITE_LABELS = {
	closeAriaLabel: "초대 페이지 닫기",
	enterButton: "입장하기",
	groupLimitReachedToast: "그룹 한도 초과했습니다.",
	groupNameFallback: "초대된 그룹",
	invitationDescription: "다음 그룹으로부터 초대를 받았습니다",
	joinFailedToast: "그룹 입장에 실패했습니다. 다시 시도해주세요.",
	loadFailedToast: "초대 정보를 불러오지 못했습니다. 다시 시도해주세요.",
	nicknameLabel: "닉네임",
	nicknameLengthError: GROUP_INVITE_NICKNAME_LENGTH_ERROR,
	nicknamePlaceholder: "닉네임을 입력해주세요",
} as const;

export {
	GROUP_INVITE_ERROR_CODES,
	GROUP_INVITE_LABELS,
	GROUP_INVITE_NICKNAME_LENGTH_ERROR,
	GROUP_INVITE_NICKNAME_MAX_LENGTH,
	GROUP_INVITE_NICKNAME_MIN_LENGTH,
};
