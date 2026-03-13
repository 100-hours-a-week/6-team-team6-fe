import NotificationList from "@/features/notification/components/NotificationList";
import { notificationMessages } from "@/features/notification/lib/constants";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

function NotificationCenterView() {
	return (
		<>
			<TitleBackHeader title={notificationMessages.centerTitle} />
			<section className="flex min-h-0 flex-1 flex-col overflow-y-scroll no-scrollbar">
				<NotificationList />
			</section>
		</>
	);
}

export { NotificationCenterView };
