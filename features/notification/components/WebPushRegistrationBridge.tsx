"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
	getWebPushSetting,
	notificationQueryKeys,
	registerPushToken,
} from "@/features/notification/api";

import {
	getFirebaseMessagingToken,
	getFirebaseMessagingVapidKey,
	registerFirebaseMessagingServiceWorker,
} from "@/shared/lib/firebase-messaging";
import { getOrCreatePushDeviceId } from "@/shared/lib/push-device";

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

				if (Notification.permission !== "granted") {
					return;
				}

				const vapidKey = getFirebaseMessagingVapidKey();
				if (!vapidKey) {
					return;
				}

				const serviceWorkerRegistration = await registerFirebaseMessagingServiceWorker();
				const deviceId = getOrCreatePushDeviceId();

				if (!deviceId) {
					return;
				}

				const token = await getFirebaseMessagingToken({
					vapidKey,
					serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
				});

				if (!token) {
					return;
				}

				await registerPushToken({
					platform: "WEB",
					deviceId,
					newToken: token,
				});
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
