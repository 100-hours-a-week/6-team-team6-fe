import { registerPushToken, updateWebPushSetting } from "@/features/notification/api";

import {
	getFirebaseMessagingServiceWorkerRegistration,
	getFirebaseMessagingToken,
	getFirebaseMessagingVapidKey,
} from "@/shared/lib/firebase-messaging";
import { getOrCreatePushDeviceId } from "@/shared/lib/push-device";

type EnableWebPushResult =
	| "enabled"
	| "unsupported"
	| "permission_denied"
	| "vapid_missing"
	| "device_id_unavailable"
	| "token_issue_failed";

async function enableWebPush(): Promise<EnableWebPushResult> {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return "unsupported";
	}

	if (Notification.permission !== "granted") {
		return "permission_denied";
	}

	const vapidKey = getFirebaseMessagingVapidKey();
	if (!vapidKey) {
		return "vapid_missing";
	}

	const serviceWorkerRegistration = await getFirebaseMessagingServiceWorkerRegistration();
	const deviceId = getOrCreatePushDeviceId();
	if (!deviceId) {
		return "device_id_unavailable";
	}

	const token = await getFirebaseMessagingToken({
		vapidKey,
		serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
	});

	if (!token) {
		return "token_issue_failed";
	}

	await registerPushToken({
		platform: "WEB",
		deviceId,
		newToken: token,
	});
	await updateWebPushSetting({ enabled: true });

	return "enabled";
}

export { enableWebPush };
export type { EnableWebPushResult };
