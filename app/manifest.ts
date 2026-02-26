import type { MetadataRoute } from "next";

const isProductionEnv = () => {
	return process.env.NODE_ENV === "production"
};

export default function manifest(): MetadataRoute.Manifest {
	const isProduction = isProductionEnv();

	const appName = isProduction ? "빌리지" : "[DEV] 빌리지";
	const shortName = isProduction ? "빌리지" : "빌리지 DEV";
	const appId = isProduction ? "/?app=billage" : "/?app=billage-dev";

	return {
		id: appId,
		name: appName,
		short_name: shortName,
		description: "빌리고, 나누고, 연결되는 공간. 우리 팀을 위한 대여 플랫폼 빌리지.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		lang: "ko-KR",
		icons: [
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/icons/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	};
}
