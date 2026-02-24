"use client";

import { useState } from "react";

import { toast } from "sonner";

import { NotificationToggle } from "@/features/notification/components/NotificationToggle";
import { useWebPushSetting } from "@/features/notification/hooks/useWebPushSetting";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

import {
	getFirebaseMessagingToken,
	getFirebaseMessagingVapidKey,
	hasRequiredFirebaseMessagingConfig,
	registerFirebaseMessagingServiceWorker,
} from "@/shared/lib/firebase-messaging";
import { getOrCreatePushDeviceId } from "@/shared/lib/push-device";

function NotificationSettingsView() {
	const {
		state: { isEnabled, isLoading, isUpdating },
		actions: { toggleEnabled },
	} = useWebPushSetting();
	const [isCheckingWebPush, setIsCheckingWebPush] = useState(false);
	const [webPushCheckResult, setWebPushCheckResult] = useState<string | null>(null);

	const handleWebPushCheck = async () => {
		if (isCheckingWebPush) {
			return;
		}

		setIsCheckingWebPush(true);

		try {
			const isNotificationSupported = typeof window !== "undefined" && "Notification" in window;

			if (!isNotificationSupported) {
				setWebPushCheckResult(
					JSON.stringify(
						{
							notificationSupported: false,
							message: "이 브라우저는 Notification API를 지원하지 않습니다.",
						},
						null,
						2,
					),
				);
				return;
			}

			const permission = await Notification.requestPermission();
			const serviceWorkerRegistration = await registerFirebaseMessagingServiceWorker();
			const deviceId = getOrCreatePushDeviceId();
			const vapidKey = getFirebaseMessagingVapidKey();

			let token: string | null = null;
			if (permission === "granted" && vapidKey) {
				token = await getFirebaseMessagingToken({
					vapidKey,
					serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
				});
			}

			setWebPushCheckResult(
				JSON.stringify(
					{
						notificationSupported: true,
						permission,
						hasRequiredFirebaseConfig: hasRequiredFirebaseMessagingConfig,
						hasVapidKey: Boolean(vapidKey),
						serviceWorkerScope: serviceWorkerRegistration?.scope ?? null,
						deviceId,
						tokenPreview: token ? `${token.slice(0, 16)}...` : null,
						tokenLength: token?.length ?? 0,
					},
					null,
					2,
				),
			);
			toast.success("웹 푸시 점검을 완료했습니다.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
			setWebPushCheckResult(
				JSON.stringify(
					{
						error: message,
					},
					null,
					2,
				),
			);
			toast.error("웹 푸시 점검에 실패했습니다.");
		} finally {
			setIsCheckingWebPush(false);
		}
	};

	return (
		<>
			<TitleBackHeader title="알림 설정" />
			<section className="flex flex-1 flex-col overflow-y-scroll pb-8 no-scrollbar">
				<HorizontalPaddingBox className="py-6">
					<div className="flex flex-col gap-5">
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col">
								<Typography type="subtitle">푸시 알림</Typography>
								<Typography type="caption" className="mt-1 block truncate-1 text-muted-foreground">
									새로운 채팅이 도착할 때 알림을 받을 수 있어요.
								</Typography>
							</div>
							<NotificationToggle
								size="lg"
								checked={isEnabled}
								onCheckedChange={toggleEnabled}
								disabled={isLoading || isUpdating}
								ariaLabel="푸시 알림 수신"
							/>
						</div>
					</div>
				</HorizontalPaddingBox>
				{process.env.NODE_ENV !== "production" ? (
					<HorizontalPaddingBox className="pb-8">
						<div className="rounded-md border border-border p-4">
							<Typography type="caption" className="text-muted-foreground">
								개발용 웹 푸시 점검
							</Typography>
							<Button
								type="button"
								variant="outline"
								className="mt-3 w-full"
								disabled={isCheckingWebPush}
								onClick={() => void handleWebPushCheck()}
							>
								{isCheckingWebPush ? "점검 중..." : "권한/SW/토큰 점검 실행"}
							</Button>
							{webPushCheckResult ? (
								<pre className="mt-3 overflow-x-auto rounded-sm bg-muted p-3 text-xs text-foreground">
									{webPushCheckResult}
								</pre>
							) : null}
						</div>
					</HorizontalPaddingBox>
				) : null}
			</section>
		</>
	);
}

export { NotificationSettingsView };
