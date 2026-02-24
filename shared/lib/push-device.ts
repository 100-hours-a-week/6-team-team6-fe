"use client";

const PUSH_DEVICE_ID_STORAGE_KEY = "billage:web-push:device-id";

const createFallbackDeviceId = () =>
	`${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const createPushDeviceId = () => {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return createFallbackDeviceId();
};

const getPushDeviceId = () => {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem(PUSH_DEVICE_ID_STORAGE_KEY);
};

const getOrCreatePushDeviceId = () => {
	if (typeof window === "undefined") {
		return null;
	}

	const existingDeviceId = getPushDeviceId();
	if (existingDeviceId) {
		return existingDeviceId;
	}

	const newDeviceId = createPushDeviceId();
	window.localStorage.setItem(PUSH_DEVICE_ID_STORAGE_KEY, newDeviceId);

	return newDeviceId;
};

const clearPushDeviceId = () => {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(PUSH_DEVICE_ID_STORAGE_KEY);
};

export {
	clearPushDeviceId,
	getOrCreatePushDeviceId,
	getPushDeviceId,
	PUSH_DEVICE_ID_STORAGE_KEY,
};
