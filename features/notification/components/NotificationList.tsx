"use client";

import { useMemo } from "react";

import { NotificationDeleteDrawer } from "@/features/notification/components/NotificationDeleteDrawer";
import {
	NotificationEmptyState,
	NotificationItem,
} from "@/features/notification/components/NotificationItem";
import { useNotificationList } from "@/features/notification/hooks/useNotificationList";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

function NotificationListLoading() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 5 }).map((_, index) => (
				<div
					key={index}
					className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-3 py-3"
				>
					<Skeleton className="size-10 rounded-full" />
					<div className="flex min-w-0 flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
						<Skeleton className="h-4 w-11/12" />
					</div>
					<Skeleton className="size-10 rounded-lg" />
				</div>
			))}
		</div>
	);
}

function NotificationListError() {
	return (
		<section className="my-auto flex flex-col gap-3 h-full justify-center items-center">
			<Typography type="subtitle">알림을 불러오지 못했어요.</Typography>
			<Typography type="body-sm" className="text-muted-foreground">
				잠시 후 다시 시도해 주세요.
			</Typography>
		</section>
	);
}

function NotificationList() {
	const {
		state: {
			notifications,
			isLoading,
			isError,
			hasNextPage,
			isFetchingNextPage,
			isDeletingNotification,
			setLoaderRef,
			selectedNotification,
		},
		actions: { openDeleteDrawer, closeDeleteDrawer, confirmDelete },
	} = useNotificationList();

	const renderedList = useMemo(
		() =>
			notifications.map((notification) => (
				<li key={notification.notificationId}>
					<NotificationItem notification={notification} onDeleteClick={openDeleteDrawer} />
				</li>
			)),
		[notifications, openDeleteDrawer],
	);

	if (isLoading) {
		return <NotificationListLoading />;
	}

	if (isError) {
		return <NotificationListError />;
	}

	if (notifications.length === 0) {
		return <NotificationEmptyState />;
	}

	return (
		<>
			<div className="flex flex-col gap-4">
				<ul className="flex flex-col">{renderedList}</ul>
				{hasNextPage ? <div ref={setLoaderRef} className="h-8" /> : null}
				{isFetchingNextPage ? (
					<div className="flex items-center justify-center gap-2 text-muted-foreground">
						<Spinner />
						<Typography type="body-sm">알림을 더 불러오는 중...</Typography>
					</div>
				) : null}
				{!hasNextPage ? (
					<Typography type="caption" className="text-center text-muted-foreground">
						모든 알림을 확인했어요.
					</Typography>
				) : null}
			</div>
			<NotificationDeleteDrawer
				open={selectedNotification !== null}
				onOpenChange={(open) => (!open ? closeDeleteDrawer() : undefined)}
				isDeleting={isDeletingNotification}
				onDelete={confirmDelete}
			/>
		</>
	);
}

export default NotificationList;
