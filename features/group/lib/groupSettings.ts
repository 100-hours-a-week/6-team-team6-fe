import { DEFAULT_GROUP_COVER_IMAGES } from "@/features/group/lib/constants";

const GROUP_SETTINGS_IMAGE_POOL = DEFAULT_GROUP_COVER_IMAGES.slice(3);

const GROUP_SETTINGS_NICKNAME_MIN_LENGTH = 2;
const GROUP_SETTINGS_NICKNAME_MAX_LENGTH = 12;

const GROUP_SETTINGS_MEMBER_COUNT = 128;

const GROUP_SETTINGS_LABELS = {
	title: "그룹 설정",
	groupNameFallback: "그룹 이름",
	profileTitle: "내 프로필",
	memberRole: "멤버",
	profileGuide: "이 그룹에서 사용할 이름을 설정해요",
	inviteGuide: "초대 링크 또는 코드로 친구를 초대해요",
	leaveGuide: "이 그룹에서 탈퇴해요",
	leaveWarning: "그룹을 탈퇴하면 대여 중인 물품 정보와 거래 내역에 접근할 수 없게 됩니다.",
	nicknameSheetTitle: "닉네임 변경",
	nicknameInputLabel: "새 닉네임",
	nicknameLengthGuide: "2~12자 이내 작성",
	nicknameLengthError: "닉네임은 2~12자 이내로 작성 가능합니다.",
	nicknameDuplicatedError: "중복된 닉네임입니다.",
	nicknameUpdatedToast: "변경되었습니다.",
	inviteSheetTitle: "멤버 초대",
	inviteLimit: "초대 제한: 제한하지 않음",
	inviteCopiedToast: "복사되었습니다",
	inviteCopyFailedToast: "복사에 실패했습니다. 다시 시도해주세요.",
	inviteLinkLoading: "초대 링크를 생성하는 중입니다.",
	loadGroupFailedToast: "그룹 정보를 불러오지 못했습니다.",
	loadProfileFailedToast: "내 프로필 정보를 불러오지 못했습니다.",
	updateNicknameFailedToast: "닉네임 변경에 실패했습니다. 다시 시도해주세요.",
	createInviteFailedToast: "초대 링크 생성에 실패했습니다. 다시 시도해주세요.",
	leaveFailedToast: "그룹 탈퇴에 실패했습니다. 다시 시도해주세요.",
	leaveSheetTitle: "그룹을 탈퇴하시겠어요?",
	leaveCompletedToast: "그룹을 탈퇴했습니다.",
} as const;

const GROUP_SETTINGS_ERROR_CODES = {
	groupNotFound: "GROUP_NOT_FOUND",
	notMembership: "IS_NOT_MEMBERSHIP",
	invalidNickname: "INVALID_NICKNAME",
} as const;

const hashString = (value: string) =>
	Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getGroupCoverImageByGroupId = (groupId: string) => {
	if (GROUP_SETTINGS_IMAGE_POOL.length === 0) {
		return DEFAULT_GROUP_COVER_IMAGES[0];
	}

	const hashValue = hashString(groupId);
	const imageIndex = hashValue % GROUP_SETTINGS_IMAGE_POOL.length;
	return GROUP_SETTINGS_IMAGE_POOL[imageIndex];
};

const resolveAppOrigin = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	return "https://billage.app";
};

const createGroupInviteLink = (invitationToken: string) =>
	`${resolveAppOrigin()}/groups/invite/${invitationToken}`;

export {
	createGroupInviteLink,
	getGroupCoverImageByGroupId,
	GROUP_SETTINGS_ERROR_CODES,
	GROUP_SETTINGS_LABELS,
	GROUP_SETTINGS_MEMBER_COUNT,
	GROUP_SETTINGS_NICKNAME_MAX_LENGTH,
	GROUP_SETTINGS_NICKNAME_MIN_LENGTH,
};
