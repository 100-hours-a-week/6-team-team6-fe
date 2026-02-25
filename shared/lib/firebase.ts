"use client";

import { type Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analyticsPromise: Promise<Analytics | null> | null = null;

function getFirebaseAnalytics() {
	if (!analyticsPromise) {
		analyticsPromise = (async () => {
			if (typeof window === "undefined") {
				return null;
			}

			const supported = await isSupported();
			if (!supported) {
				return null;
			}

			return getAnalytics(firebaseApp);
		})();
	}

	return analyticsPromise;
}

export { firebaseApp, getFirebaseAnalytics };
