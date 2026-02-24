"use client";

import { NotificationToggle } from "@/features/notification/components/NotificationToggle";
import { useWebPushSetting } from "@/features/notification/hooks/useWebPushSetting";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Typography } from "@/shared/components/ui/typography";

function NotificationSettingsView() {
	const {
		state: { isEnabled, isLoading, isUpdating },
		actions: { toggleEnabled },
	} = useWebPushSetting();

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
			</section>
		</>
	);
}

export { NotificationSettingsView };
