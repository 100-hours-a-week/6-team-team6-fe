import "./globals.css";

import { Geist, Geist_Mono, Inter } from "next/font/google";

import type { Metadata } from "next";

import { Toaster } from "@/shared/components/ui/sonner";

import Providers from "@/shared/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "BILLAGE",
	description: "그룹을 위한 대여 서비스, 빌리지",
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
