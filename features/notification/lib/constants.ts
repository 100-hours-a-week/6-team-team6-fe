const notificationTypes = {
	chatroom: "CHATROOM",
	post: "POST",
} as const;

const notificationTypeValues = [notificationTypes.chatroom, notificationTypes.post] as const;
const pushTokenPlatformValues = ["WEB", "IOS", "AOS"] as const;

const notificationMessages = {
	centerTitle: "알림",
	listLoadingMore: "알림을 더 불러오는 중...",
	listEnd: "모든 알림을 확인했어요.",
	empty: "확인할 알림이 없어요.",
	deleteDrawerTitle: "알림을 삭제하시겠습니까?",
	deleteDrawerDescription: "삭제한 알림은 다시 복구할 수 없어요.",
	deleteAction: "삭제",
	cancelAction: "취소",
	settingsTitle: "알림 설정",
	pushTitle: "푸시 알림",
	pushDescription: "새로운 채팅이 도착할 때 알림을 받을 수 있어요.",
	toggleAriaLabel: "푸시 알림 수신",
	permissionActionLabel: "권한 허용",
	permissionGrantedRetry: "권한이 허용되었어요. 알림 토글을 다시 켜주세요.",
	typeLabels: {
		CHATROOM: "채팅 알림",
		POST: "게시글 알림",
	},
} as const;

const notificationErrorMessages = {
	loadNotifications: "알림 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
	deleteNotification: "알림 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",
	listLoadFailedTitle: "알림을 불러오지 못했어요.",
	listLoadFailedDescription: "잠시 후 다시 시도해 주세요.",
	loadSettings: "알림 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
	updateSettings: "알림 설정 변경에 실패했어요. 잠시 후 다시 시도해 주세요.",
	tokenDeleteFailed: "토큰 정리에 실패했어요. 잠시 후 다시 시도해 주세요.",
	notificationUnsupported: "이 디바이스 환경은 푸시 알림을 지원하지 않습니다.",
	notificationPermissionDenied: "알림 권한이 필요합니다.",
	vapidKeyMissing: "VAPID 키가 설정되지 않았어요.",
	deviceIdUnavailable: "디바이스 ID를 생성하지 못했어요.",
	tokenIssueFailed: "FCM 토큰 발급에 실패했어요.",
	permissionStillDenied: "알림 권한이 허용되지 않았어요.",
	permissionDeniedGuide: "브라우저 또는 기기 설정에서 알림을 허용한 뒤 다시 시도해 주세요.",
} as const;

const notificationListConfig = {
	rootMargin: "0px 0px 160px 0px",
	skeletonCount: 5,
} as const;

export {
	notificationErrorMessages,
	notificationListConfig,
	notificationMessages,
	notificationTypes,
	notificationTypeValues,
	pushTokenPlatformValues,
};
