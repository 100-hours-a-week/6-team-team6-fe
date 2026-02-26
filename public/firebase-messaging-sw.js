const FIREBASE_SDK_VERSION = "12.9.0";

const getFirebaseConfigFromSearchParams = () => {
	const searchParams = new URL(self.location.href).searchParams;

	return {
		apiKey: searchParams.get("apiKey"),
		authDomain: searchParams.get("authDomain"),
		projectId: searchParams.get("projectId"),
		storageBucket: searchParams.get("storageBucket"),
		messagingSenderId: searchParams.get("messagingSenderId"),
		appId: searchParams.get("appId"),
		measurementId: searchParams.get("measurementId"),
	};
};

const hasRequiredFirebaseConfig = (firebaseConfig) =>
	Boolean(firebaseConfig.apiKey) &&
	Boolean(firebaseConfig.projectId) &&
	Boolean(firebaseConfig.messagingSenderId) &&
	Boolean(firebaseConfig.appId);

self.addEventListener("install", (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

const openOrFocusClientWindow = async (targetUrl) => {
	const clientList = await self.clients.matchAll({
		type: "window",
		includeUncontrolled: true,
	});

	const target = new URL(targetUrl, self.location.origin).toString();

	for (const client of clientList) {
		if ("focus" in client) {
			await client.navigate(target);
			return client.focus();
		}
	}

	return self.clients.openWindow(target);
};

const firebaseConfig = getFirebaseConfigFromSearchParams();

if (hasRequiredFirebaseConfig(firebaseConfig)) {
	importScripts(
		`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js`,
	);
	importScripts(
		`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-compat.js`,
	);

	firebase.initializeApp(firebaseConfig);

	const messaging = firebase.messaging();

	messaging.onBackgroundMessage((payload) => {
		const notificationData = payload?.data ?? {};
		const notificationTitle = notificationData.title ?? payload?.notification?.title ?? "새 알림";
		const notificationBody = notificationData.body ?? payload?.notification?.body ?? "";

		const notificationOptions = {
			body: notificationBody,
			data: notificationData,
		};

		return self.registration.showNotification(notificationTitle, notificationOptions);
	});
}

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const notificationData = event.notification.data ?? {};

	const targetUrl =
		typeof notificationData.targetUrl === "string" && notificationData.targetUrl.length > 0
			? notificationData.targetUrl
			: "/";

	event.waitUntil(openOrFocusClientWindow(targetUrl));
});
