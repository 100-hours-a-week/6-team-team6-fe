"use client";

import { NotificationToggle } from "@/features/notification/components/NotificationToggle";
import { useWebPushSetting } from "@/features/notification/hooks/useWebPushSetting";
import { notificationMessages } from "@/features/notification/lib/constants";

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
			<TitleBackHeader title={notificationMessages.settingsTitle} />
			<section className="flex flex-1 flex-col overflow-y-scroll pb-8 no-scrollbar">
				<HorizontalPaddingBox className="py-6">
					<div className="flex flex-col gap-5">
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col">
								<Typography type="subtitle">{notificationMessages.pushTitle}</Typography>
								<Typography type="caption" className="mt-1 block truncate-1 text-muted-foreground">
									{notificationMessages.pushDescription}
								</Typography>
							</div>
							<NotificationToggle
								size="lg"
								checked={isEnabled}
								onCheckedChange={toggleEnabled}
								disabled={isLoading || isUpdating}
								ariaLabel={notificationMessages.toggleAriaLabel}
							/>
						</div>
					</div>
				</HorizontalPaddingBox>
			</section>
		</>
	);
}

export { NotificationSettingsView };
