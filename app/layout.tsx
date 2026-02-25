import "./globals.css";

import { Suspense } from "react";

import { Noto_Sans_KR } from "next/font/google";

import type { Metadata, Viewport } from "next";

import { GoogleAnalytics } from "@/shared/components/analytics/GoogleAnalytics";
import { PwaServiceWorkerBridge } from "@/shared/components/pwa/PwaServiceWorkerBridge";
import { Toaster } from "@/shared/components/ui/sonner";

import { Providers } from "@/shared/providers";

const notoSansKr = Noto_Sans_KR({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	applicationName: "빌리지",
	title: "그룹을 위한 대여 서비스, 빌리지",
	description: "빌리고, 나누고, 연결되는 공간. 우리 팀을 위한 대여 플랫폼 빌리지.",
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "빌리지",
	},
	openGraph: {
		url: "https://www.billages.com/",
		type: "website",
		title: "그룹을 위한 대여 서비스, 빌리지",
		description: "빌리고, 나누고, 연결되는 공간. 우리 팀을 위한 대여 플랫폼 빌리지.",
		images: [
			{
				url: "https://www.billages.com/description.png",
				alt: "빌리지 소개 이미지",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "그룹을 위한 대여 서비스, 빌리지",
		description: "빌리고, 나누고, 연결되는 공간. 우리 팀을 위한 대여 플랫폼 빌리지.",
		images: ["https://www.billages.com/description.png"],
	},
	other: {
		"twitter:domain": "www.billages.com",
		"twitter:url": "https://www.billages.com/",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#ffffff",
};

function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={notoSansKr.variable}>
			<body className="antialiased">
				<Providers>
					<div className="app">
						<main className="flex-1 flex flex-col">{children}</main>
						<Toaster />
						<PwaServiceWorkerBridge />
					</div>
				</Providers>
				<Suspense fallback={null}>
					<GoogleAnalytics />
				</Suspense>
			</body>
		</html>
	);
}

export default RootLayout;
