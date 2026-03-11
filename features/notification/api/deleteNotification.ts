"use client";

import { DeleteNotificationError } from "@/features/notification/api/notificationApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

async function deleteNotification(notificationId: number): Promise<void> {
	await requestVoid(
		apiClient.delete(`users/me/notifications/${notificationId}`),
		DeleteNotificationError,
	);
}

export { deleteNotification };
