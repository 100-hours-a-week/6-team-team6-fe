import "./globals.css";

import { Inter } from "next/font/google";

import type { Metadata } from "next";

import { Toaster } from "@/shared/components/ui/sonner";

import { Providers } from "@/shared/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "그룹을 위한 대여 서비스, 빌리지",
	description: "빌리고, 나누고, 연결되는 공간. 우리 팀을 위한 대여 플랫폼 빌리지.",
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

export const viewport = {
	width: "device-width",
	initialScale: 1,
};

function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.variable}>
			<body className="antialiased">
				<Providers>
					<div className="app">
						<main className="flex-1 flex flex-col">{children}</main>
						<Toaster />
					</div>
				</Providers>
			</body>
		</html>
	);
}

export default RootLayout;
