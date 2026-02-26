type NotificationPermissionRequestResult = NotificationPermission | "unsupported";

const isNotificationSupported = () =>
	typeof window !== "undefined" && "Notification" in window;

const getCurrentNotificationPermission = (): NotificationPermissionRequestResult => {
	if (!isNotificationSupported()) {
		return "unsupported";
	}

	return Notification.permission;
};

async function requestNotificationPermission(): Promise<NotificationPermissionRequestResult> {
	const currentPermission = getCurrentNotificationPermission();
	if (currentPermission === "unsupported") {
		return "unsupported";
	}

	if (currentPermission === "granted" || currentPermission === "denied") {
		return currentPermission;
	}

	try {
		return await Notification.requestPermission();
	} catch {
		return "default";
	}
}

export { getCurrentNotificationPermission, requestNotificationPermission };
export type { NotificationPermissionRequestResult };
