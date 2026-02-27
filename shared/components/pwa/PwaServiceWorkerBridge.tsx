"use client";

import { useEffect } from "react";

import { registerFirebaseMessagingServiceWorker } from "@/shared/lib/firebase-messaging";

const isDevelopment = process.env.NODE_ENV === "development";

export function PwaServiceWorkerBridge() {
	useEffect(() => {
		const registerServiceWorker = async () => {
			try {
				await registerFirebaseMessagingServiceWorker();
			} catch (error) {
				if (isDevelopment) {
					console.warn("[PWA] Service worker registration failed.", error);
				}
			}
		};

		void registerServiceWorker();
	}, []);

	return null;
}
