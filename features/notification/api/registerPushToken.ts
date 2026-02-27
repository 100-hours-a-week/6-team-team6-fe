"use client";

import { RegisterPushTokenError } from "@/features/notification/api/notificationApiError";
import type { PushTokenRegisterDto } from "@/features/notification/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

type RegisterPushTokenParams = PushTokenRegisterDto;

async function registerPushToken(params: RegisterPushTokenParams): Promise<void> {
	const { platform, deviceId, newToken } = params;

	await requestVoid(
		apiClient.post("users/me/push-token", {
			json: {
				platform,
				deviceId,
				newToken,
			},
		}),
		RegisterPushTokenError,
	);
}

export type { RegisterPushTokenParams };
export { registerPushToken };
