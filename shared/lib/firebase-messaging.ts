"use client";

import type { MessagePayload, Messaging } from "firebase/messaging";
import {
	getMessaging,
	getToken,
	isSupported as isMessagingSupported,
	onMessage,
} from "firebase/messaging";

import { firebaseApp } from "@/shared/lib/firebase";

const FIREBASE_MESSAGING_SW_PATH = "/firebase-messaging-sw.js";

const firebaseMessagingConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log(firebaseMessagingConfig);

const firebaseMessagingVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? "";

const hasRequiredFirebaseMessagingConfig =
	Boolean(firebaseMessagingConfig.apiKey) &&
	Boolean(firebaseMessagingConfig.projectId) &&
	Boolean(firebaseMessagingConfig.messagingSenderId) &&
	Boolean(firebaseMessagingConfig.appId);

const hasFirebaseMessagingVapidKey = firebaseMessagingVapidKey.length > 0;

const getFirebaseMessagingVapidKey = () =>
	hasFirebaseMessagingVapidKey ? firebaseMessagingVapidKey : null;

let messagingPromise: Promise<Messaging | null> | null = null;

const buildFirebaseMessagingServiceWorkerUrl = () => {
	const searchParams = new URLSearchParams();

	Object.entries(firebaseMessagingConfig).forEach(([key, value]) => {
		if (!value) {
			return;
		}

		searchParams.set(key, value);
	});

	const queryString = searchParams.toString();
	return queryString
		? `${FIREBASE_MESSAGING_SW_PATH}?${queryString}`
		: FIREBASE_MESSAGING_SW_PATH;
};

async function registerFirebaseMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return null;
	}

	return navigator.serviceWorker.register(
		buildFirebaseMessagingServiceWorkerUrl(),
		{ scope: "/" },
	);
}

async function getFirebaseMessaging(): Promise<Messaging | null> {
	if (!messagingPromise) {
		messagingPromise = (async () => {
			if (typeof window === "undefined") {
				return null;
			}

			if (!hasRequiredFirebaseMessagingConfig) {
				return null;
			}

			const supported = await isMessagingSupported();
			if (!supported) {
				return null;
			}

			return getMessaging(firebaseApp);
		})();
	}

	return messagingPromise;
}

interface GetFirebaseMessagingTokenParams {
	vapidKey: string;
	serviceWorkerRegistration?: ServiceWorkerRegistration;
}

async function getFirebaseMessagingToken(
	params: GetFirebaseMessagingTokenParams,
): Promise<string | null> {
	if (typeof window === "undefined") {
		return null;
	}

	if (Notification.permission !== "granted") {
		return null;
	}

	const messaging = await getFirebaseMessaging();
	if (!messaging) {
		return null;
	}

	const { vapidKey, serviceWorkerRegistration } = params;

	return getToken(messaging, {
		vapidKey,
		serviceWorkerRegistration,
	});
}

async function subscribeFirebaseForegroundMessage(
	listener: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
	const messaging = await getFirebaseMessaging();
	if (!messaging) {
		return null;
	}

	return onMessage(messaging, listener);
}

export type { GetFirebaseMessagingTokenParams };
export {
	getFirebaseMessaging,
	getFirebaseMessagingToken,
	getFirebaseMessagingVapidKey,
	hasFirebaseMessagingVapidKey,
	hasRequiredFirebaseMessagingConfig,
	registerFirebaseMessagingServiceWorker,
	subscribeFirebaseForegroundMessage,
};
