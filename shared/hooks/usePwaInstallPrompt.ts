"use client";

import { useCallback, useEffect, useState } from "react";

type InstallPromptOutcome = "accepted" | "dismissed" | "unavailable";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
}

const isStandaloneDisplayMode = () => {
	if (typeof window === "undefined") {
		return false;
	}

	const isStandaloneFromMediaQuery = window.matchMedia("(display-mode: standalone)").matches;
	const isStandaloneFromNavigator = (window.navigator as Navigator & { standalone?: boolean })
		.standalone;

	return isStandaloneFromMediaQuery || isStandaloneFromNavigator === true;
};

function usePwaInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalled, setIsInstalled] = useState(isStandaloneDisplayMode);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const displayModeMediaQuery = window.matchMedia("(display-mode: standalone)");

		const handleDisplayModeChange = (event: MediaQueryListEvent) => {
			if (event.matches) {
				setIsInstalled(true);
			}
		};

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		};

		const handleAppInstalled = () => {
			setIsInstalled(true);
			setDeferredPrompt(null);
		};

		displayModeMediaQuery.addEventListener("change", handleDisplayModeChange);
		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			displayModeMediaQuery.removeEventListener("change", handleDisplayModeChange);
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
		if (!deferredPrompt) {
			return "unavailable";
		}

		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		setDeferredPrompt(null);
		return outcome;
	}, [deferredPrompt]);

	return {
		isInstallable: !isInstalled && deferredPrompt !== null,
		isInstalled,
		promptInstall,
	};
}

export { usePwaInstallPrompt };
export type { InstallPromptOutcome };
