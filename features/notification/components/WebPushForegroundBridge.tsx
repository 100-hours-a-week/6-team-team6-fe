"use client";

import { useEffect } from "react";

import {
	getFirebaseMessagingServiceWorkerRegistration,
	subscribeFirebaseForegroundMessage,
} from "@/shared/lib/firebase-messaging";

export function WebPushForegroundBridge() {
	useEffect(() => {
		let isUnmounted = false;
		let unsubscribe: (() => void) | null = null;

		const initializeForegroundNotification = async () => {
			await getFirebaseMessagingServiceWorkerRegistration();

			const release = await subscribeFirebaseForegroundMessage(() => {});

			/**
			 * note: 필요 시 foreground이고, url이 다르면 toast 등으로 알림 UI를 띄워서 진입 돕기
			 */
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
