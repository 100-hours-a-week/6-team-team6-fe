"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { DownloadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Typography } from "@/shared/components/ui/typography";

import { usePwaInstallPrompt } from "@/shared/hooks/usePwaInstallPrompt";

const DISMISS_STORAGE_KEY = "billage:pwa-install-banner-dismissed-at";
const DISMISS_DURATION = 1000 * 60 * 60 * 24;
const PWA_INSTALL_GUIDE_URL = "https://billages.notion.site/Billage-3135e71cb26c80b7a590e7a8b9a444c1";

const getDismissedState = () => {
	if (typeof window === "undefined") {
		return false;
	}

	const rawValue = window.localStorage.getItem(DISMISS_STORAGE_KEY);
	if (!rawValue) {
		return false;
	}

	const dismissedAt = Number(rawValue);
	if (!Number.isFinite(dismissedAt)) {
		return false;
	}

	return Date.now() - dismissedAt < DISMISS_DURATION;
};

const getGuideSteps = (isIosSafari: boolean) => {
	if (isIosSafari) {
		return [
			"하단의 공유 버튼을 눌러 주세요.",
			"'홈 화면에 추가'를 선택해 주세요.",
			"'추가'를 누르면 설치가 완료돼요.",
		];
	}

	return [
		"브라우저 메뉴(⋮)를 열어 주세요.",
		"'앱 설치' 또는 '홈 화면에 추가'를 선택해 주세요.",
		"'설치'를 누르면 홈 화면에 추가돼요.",
	];
};

const isIosSafariBrowser = () => {
	if (typeof window === "undefined") {
		return false;
	}

	const userAgent = window.navigator.userAgent.toLowerCase();
	const isIos = /iphone|ipad|ipod/.test(userAgent);
	const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|edgios/.test(userAgent);

	return isIos && isSafari;
};

function PwaInstallBanner() {
	const { isInstallable, isInstalled, promptInstall } = usePwaInstallPrompt();
	const [isGuideOpen, setIsGuideOpen] = useState(false);
	const [isDismissed, setIsDismissed] = useState(getDismissedState);
	const [isIosSafari] = useState(isIosSafariBrowser);

	const guideSteps = useMemo(() => getGuideSteps(isIosSafari), [isIosSafari]);

	if (isInstalled || isDismissed) {
		return null;
	}

	const handleDismiss = () => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
		}
		setIsDismissed(true);
	};

	const handleInstallAction = async () => {
		if (!isInstallable) {
			setIsGuideOpen(true);
			return;
		}

		const outcome = await promptInstall();
		if (outcome === "accepted") {
			toast.success("설치 요청이 완료됐어요.");
			return;
		}

		if (outcome === "dismissed") {
			toast.message("설치가 취소되었어요. 언제든 다시 설치할 수 있어요.");
			return;
		}

		setIsGuideOpen(true);
	};

	return (
		<>
			<div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
				<HorizontalPaddingBox className="py-2">
					<div className="flex items-center gap-3">
						<div className="size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
							<Image
								src="/icons/icon-192.png"
								alt="빌리지 앱 아이콘"
								width={40}
								height={40}
								className="size-full object-cover"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<Typography type="subtitle" className="truncate-1 text-sm">
								빌리지를 설치해 보세요
							</Typography>
							<Typography type="caption" className="truncate-1">
								홈 화면에서 더 빠르게 접속할 수 있어요.
							</Typography>
						</div>
						<Button size="sm" className="h-8 px-3 text-xs" onClick={() => void handleInstallAction()}>
							<DownloadIcon className="size-3.5" />
							{isInstallable ? "설치" : "방법"}
						</Button>
						<Button
							variant="icon"
							size="icon-sm"
							className="text-muted-foreground"
							onClick={handleDismiss}
							aria-label="설치 배너 닫기"
						>
							<XIcon />
						</Button>
					</div>
				</HorizontalPaddingBox>
			</div>

			<Drawer open={isGuideOpen} onOpenChange={setIsGuideOpen}>
				<DrawerContent>
					<DrawerHeader className="text-left">
						<DrawerTitle>앱 설치 방법</DrawerTitle>
						<DrawerDescription >
							{'브라우저마다 메뉴 이름이 조금 다를 수 있어요. \n 아래 순서대로 진행해 주세요.'}
						</DrawerDescription>
					</DrawerHeader>

					<div className="space-y-4 overflow-y-auto px-(--p-layout-horizontal) pb-2">
						<div className="rounded-xl border border-border bg-muted/40 p-3 flex flex-col gap-y-2">
							<ol className="space-y-1.5 text-sm">
								{guideSteps.map((step, index) => (
									<li key={step} className="flex gap-2">
										<span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
											{index + 1}
										</span>
										<span>{step}</span>
									</li>
								))}
							</ol>
							<a
								href={PWA_INSTALL_GUIDE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-3 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
							>
								설치 가이드 자세히 보기
							</a>
						</div>
					</div>

					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="outline">닫기</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}

export { PwaInstallBanner };
