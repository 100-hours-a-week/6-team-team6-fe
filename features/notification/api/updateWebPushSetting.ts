"use client";

import { UpdateWebPushSettingError } from "@/features/notification/api/notificationApiError";
import type {
	WebPushSettingDto,
	WebPushSettingUpdateDto,
} from "@/features/notification/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

type UpdateWebPushSettingParams = WebPushSettingUpdateDto;

async function updateWebPushSetting(
	params: UpdateWebPushSettingParams,
): Promise<WebPushSettingDto> {
	const { enabled } = params;

	await requestVoid(
		apiClient.put("users/me/web-push", {
			json: { enabled },
		}),
		UpdateWebPushSettingError,
	);

	return { enabled };
}

export type { UpdateWebPushSettingParams };
export { updateWebPushSetting };
