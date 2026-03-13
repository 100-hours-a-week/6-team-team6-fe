const notificationQueryKeysBase = ["notifications"] as const;

export const notificationQueryKeys = {
	all: () => notificationQueryKeysBase,
	list: () => [...notificationQueryKeys.all(), "list"] as const,
	webPushSetting: () => [...notificationQueryKeys.all(), "web-push-setting"] as const,
};
