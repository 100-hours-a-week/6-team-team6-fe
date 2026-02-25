"use client";

import { useEffect } from "react";

import type { MessagePayload } from "firebase/messaging";

import {
	registerFirebaseMessagingServiceWorker,
	subscribeFirebaseForegroundMessage,
} from "@/shared/lib/firebase-messaging";

const DEFAULT_NOTIFICATION_TITLE = "새 알림";

const buildForegroundNotification = (payload: MessagePayload) => {
	const notificationData = payload.data ?? {};
	const title =
		notificationData.title ?? payload.notification?.title ?? DEFAULT_NOTIFICATION_TITLE;
	const body = notificationData.body ?? payload.notification?.body ?? "";

	return {
		title,
		body,
		data: notificationData,
	};
};

export function WebPushForegroundBridge() {
	useEffect(() => {
		let isUnmounted = false;
		let unsubscribe: (() => void) | null = null;

		const initializeForegroundNotification = async () => {
			await registerFirebaseMessagingServiceWorker();

			const release = await subscribeFirebaseForegroundMessage(async (payload) => {
				if (typeof window === "undefined" || !("Notification" in window)) {
					return;
				}

				if (Notification.permission !== "granted") {
					return;
				}

				const { title, body, data } = buildForegroundNotification(payload);
				const serviceWorkerRegistration = await navigator.serviceWorker.ready;

				await serviceWorkerRegistration.showNotification(title, {
					body,
					data,
				});
			});

			if (isUnmounted) {
				release?.();
				return;
			}

			unsubscribe = release;
		};

		void initializeForegroundNotification();

		return () => {
			isUnmounted = true;
			unsubscribe?.();
		};
	}, []);

	return null;
}
