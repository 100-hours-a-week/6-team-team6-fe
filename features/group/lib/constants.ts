export const GROUP_GRID_CAPACITY = 6;

export const GROUP_LIST_LABELS = {
	myGroupSection: "내 그룹",
	myPostSection: "내가 쓴 글",
	createGroup: "새 그룹 만들기",
	groupError: "내 그룹을 불러오지 못했습니다.",
	myPostError: "내가 쓴 글을 불러오지 못했습니다.",
	myPostEmptyTitle: "작성한 글이 없어요.\n물품을 등록하고 그룹원과 함께 나눠 보세요.",
	myPostLoadingMore: "내가 쓴 글을 더 불러오는 중",
} as const;

export const DEFAULT_GROUP_COVER_IMAGES = Array.from(
	{ length: 8 },
	(_, index) => `/group-cover-images/group-cover-${index + 1}.png`,
);

export const GROUP_CREATE_IMAGE_INPUT_ACCEPT = "image/jpeg,image/png";

export const GROUP_CREATE_LABELS = {
	title: "그룹 만들기",
	selectedCoverAlt: "선택된 그룹 대표 이미지",
	coverSelectionTitle: "커버 선택",
	uploadedCoverLabel: "업로드한 커버 이미지",
	defaultCoverLabelPrefix: "기본 그룹 커버 이미지",
	groupNameLabel: "그룹 이름",
	groupNamePlaceholder: "이름을 입력해주세요",
	submit: "등록하기",
	submitting: "등록 중...",
} as const;

export const GROUP_CREATE_MESSAGES = {
	imageInvalid: "이미지는 5MB 이하의 JPG/PNG만 업로드할 수 있어요.",
	imageUploadFailed: "업로드에 실패했습니다. 다시 시도해주세요.",
	imagePermissionRequired: "사진 접근 권한이 필요합니다.",
	createFailed: "그룹 생성에 실패했습니다. 다시 시도해주세요.",
} as const;
