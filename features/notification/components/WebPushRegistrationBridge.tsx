"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
	deletePushToken,
	getWebPushSetting,
	notificationQueryKeys,
} from "@/features/notification/api";
import { enableWebPush } from "@/features/notification/lib/enableWebPush";

import { getPushDeviceId } from "@/shared/lib/push-device";

export function WebPushRegistrationBridge() {
	const queryClient = useQueryClient();

	useEffect(() => {
		let isUnmounted = false;

		const syncWebPushRegistration = async () => {
			if (typeof window === "undefined" || !("Notification" in window)) {
				return;
			}

			try {
				const setting = await getWebPushSetting();

				if (!setting?.enabled) {
					return;
				}

				if (Notification.permission === "denied") {
					const deviceId = getPushDeviceId();
					if (deviceId) {
						try {
							await deletePushToken(deviceId);
						} catch {}
					}
					return;
				}

				if (Notification.permission !== "granted") {
					return;
				}

				await enableWebPush();
			} catch {
				// NOTE: 앱 시작 시 자동 동기화는 best-effort로 처리
				// 실패하더라도 사용자에게 알리지 않고 조용히 실패 처리
			} finally {
				if (!isUnmounted) {
					void queryClient.invalidateQueries({
						queryKey: notificationQueryKeys.webPushSetting(),
					});
				}
			}
		};

		void syncWebPushRegistration();

		return () => {
			isUnmounted = true;
		};
	}, [queryClient]);

	return null;
}
