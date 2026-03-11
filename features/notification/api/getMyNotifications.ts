"use client";

import { GetMyNotificationsError } from "@/features/notification/api/notificationApiError";
import type { NotificationsResponse } from "@/features/notification/schemas";
import { notificationsResponseSchema } from "@/features/notification/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetMyNotificationsParams = {
	cursor?: string;
};

async function getMyNotifications(
	params: GetMyNotificationsParams = {},
): Promise<NotificationsResponse> {
	const { cursor } = params;
	const searchParams = cursor ? { cursor } : undefined;

	const parsed = await requestJson(
		apiClient.get("users/me/notifications", { searchParams }),
		notificationsResponseSchema,
		GetMyNotificationsError,
	);

	return parsed;
}

export type { GetMyNotificationsParams };
export { getMyNotifications };
