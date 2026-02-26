"use client";

import dynamic from "next/dynamic";

const PwaInstallBanner = dynamic(
	() =>
		import("@/shared/components/pwa/PwaInstallBanner").then((module) => ({
			default: module.PwaInstallBanner,
		})),
	{ ssr: false },
);

function PwaInstallBannerSlot() {
	return <PwaInstallBanner />;
}

export { PwaInstallBannerSlot };
