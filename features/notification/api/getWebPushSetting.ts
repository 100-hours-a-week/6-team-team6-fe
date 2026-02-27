"use client";

import { GetWebPushSettingError } from "@/features/notification/api/notificationApiError";
import type { WebPushSettingDto } from "@/features/notification/schemas";
import { webPushSettingSchema } from "@/features/notification/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

async function getWebPushSetting(): Promise<WebPushSettingDto> {
	const parsed = await requestJson(
		apiClient.get("users/me/web-push"),
		webPushSettingSchema,
		GetWebPushSettingError,
	);

	return parsed;
}

export { getWebPushSetting };
