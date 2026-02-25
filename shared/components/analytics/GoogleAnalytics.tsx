"use client";

import { useEffect } from "react";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || "";

function GoogleAnalytics() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const search = searchParams.toString();

	useEffect(() => {
		if (!GA_MEASUREMENT_ID) {
			return;
		}

		window.dataLayer = window.dataLayer || [];
		window.gtag =
			window.gtag ||
			((...args: unknown[]) => {
				window.dataLayer.push(args);
			});

		const pagePath = search ? `${pathname}?${search}` : pathname;
		window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath });
	}, [pathname, search]);

	if (!GA_MEASUREMENT_ID) {
		return null;
	}

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				strategy="afterInteractive"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					window.gtag = gtag;
					gtag("js", new Date());
					gtag("config", "${GA_MEASUREMENT_ID}", { send_page_view: false });
				`}
			</Script>
		</>
	);
}

export { GoogleAnalytics };
