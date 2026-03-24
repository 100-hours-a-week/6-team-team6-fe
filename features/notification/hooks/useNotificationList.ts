"use client";

import { useCallback, useState } from "react";

import { useNotifications } from "@/features/notification/hooks/useNotifications";
import type { Notification } from "@/features/notification/schemas";

type NotificationListState = ReturnType<typeof useNotifications>["state"] & {
	selectedNotification: Notification | null;
};

type NotificationListActions = {
	openDeleteDrawer: (notification: Notification) => void;
	closeDeleteDrawer: () => void;
	confirmDelete: () => Promise<void>;
};

function useNotificationList(): {
	state: NotificationListState;
	actions: NotificationListActions;
} {
	const { state, actions } = useNotifications();
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

	const openDeleteDrawer = useCallback((notification: Notification) => {
		setSelectedNotification(notification);
	}, []);

	const closeDeleteDrawer = useCallback(() => {
		setSelectedNotification(null);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!selectedNotification) {
			return;
		}

		try {
			await actions.deleteNotificationItem(selectedNotification.notificationId);
			setSelectedNotification(null);
		} catch {
			// error toast is handled in the data hook
		}
	}, [actions, selectedNotification]);

	return {
		state: {
			...state,
			selectedNotification,
		},
		actions: {
			openDeleteDrawer,
			closeDeleteDrawer,
			confirmDelete,
		},
	};
}

export { useNotificationList };
export type { NotificationListActions, NotificationListState };
