"use client";

import { DeletePushTokenError } from "@/features/notification/api/notificationApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

async function deletePushToken(deviceId: string): Promise<void> {
	const encodedDeviceId = encodeURIComponent(deviceId);

	await requestVoid(
		apiClient.delete(`users/me/push-token/${encodedDeviceId}`),
		DeletePushTokenError,
	);
}

export { deletePushToken };
