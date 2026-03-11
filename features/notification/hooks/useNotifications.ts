"use client";

import { useCallback, useEffect, useMemo } from "react";

import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
	deleteNotification,
	getMyNotifications,
	notificationQueryKeys,
} from "@/features/notification/api";
import type { Notification, NotificationsResponse } from "@/features/notification/schemas";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

type UseNotificationsOptions = {
	rootMargin?: string;
};

type NotificationsState = {
	notifications: Notification[];
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isDeletingNotification: boolean;
	setLoaderRef: (node: HTMLDivElement | null) => void;
};

type NotificationsActions = {
	deleteNotificationItem: (notificationId: number) => Promise<void>;
};

type DeleteContext = {
	previousData?: InfiniteData<NotificationsResponse, string | undefined>;
};

export const NOTIFICATION_MESSAGES = {
	loadFailed: "알림 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
	deleteFailed: "알림 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

const removeNotificationFromPages = (
	data: InfiniteData<NotificationsResponse, string | undefined> | undefined,
	notificationId: number,
) => {
	if (!data) {
		return data;
	}

	return {
		...data,
		pages: data.pages.map((page) => ({
			...page,
			notifications: page.notifications.filter(
				(notification) => notification.notificationId !== notificationId,
			),
		})),
	};
};

const resolveNotificationErrorMessage = (error: unknown, fallbackMessage: string) => {
	const code = getApiErrorCode(error);
	const mappedMessage = getApiErrorMessage(code);
	if (mappedMessage) {
		return mappedMessage;
	}

	if (error instanceof Error && error.message && error.message !== "UNKNOWN_ERROR") {
		return error.message;
	}

	return fallbackMessage;
};

function useNotifications(options: UseNotificationsOptions = {}): {
	state: NotificationsState;
	actions: NotificationsActions;
} {
	const { rootMargin = "0px 0px 160px 0px" } = options;
	const queryClient = useQueryClient();
	const queryKey = notificationQueryKeys.list();

	const notificationsQuery = useInfiniteQuery<
		NotificationsResponse,
		Error,
		InfiniteData<NotificationsResponse, string | undefined>,
		typeof queryKey,
		string | undefined
	>({
		queryKey,
		queryFn: ({ pageParam }) => getMyNotifications({ cursor: pageParam }),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
	});

	const notifications = useMemo(
		() => notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
		[notificationsQuery.data],
	);

	const { fetchNextPage, hasNextPage, isFetchingNextPage } = notificationsQuery;

	const loadMore = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}

		void fetchNextPage();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const { setTarget } = useIntersectionObserver<HTMLDivElement>({
		onIntersect: loadMore,
		enabled: Boolean(hasNextPage),
		rootMargin,
	});

	const deleteMutation = useMutation<void, unknown, number, DeleteContext>({
		mutationFn: (notificationId) => deleteNotification(notificationId),
		onMutate: async (notificationId) => {
			await queryClient.cancelQueries({ queryKey });
			const previousData =
				queryClient.getQueryData<InfiniteData<NotificationsResponse, string | undefined>>(queryKey);

			queryClient.setQueryData<InfiniteData<NotificationsResponse, string | undefined>>(
				queryKey,
				(currentData) => removeNotificationFromPages(currentData, notificationId),
			);

			return { previousData };
		},
		onError: (error, _notificationId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}

			toast.error(resolveNotificationErrorMessage(error, NOTIFICATION_MESSAGES.deleteFailed));
		},
	});

	useEffect(() => {
		if (!notificationsQuery.error) {
			return;
		}

		toast.error(
			resolveNotificationErrorMessage(notificationsQuery.error, NOTIFICATION_MESSAGES.loadFailed),
		);
	}, [notificationsQuery.error]);

	const deleteNotificationItem = useCallback(
		async (notificationId: number) => {
			await deleteMutation.mutateAsync(notificationId);
		},
		[deleteMutation],
	);

	return {
		state: {
			notifications,
			isLoading: notificationsQuery.isLoading,
			isError: notificationsQuery.isError,
			hasNextPage: Boolean(hasNextPage),
			isFetchingNextPage,
			isDeletingNotification: deleteMutation.isPending,
			setLoaderRef: setTarget,
		},
		actions: {
			deleteNotificationItem,
		},
	};
}

export { useNotifications };
export type { NotificationsActions, NotificationsState, UseNotificationsOptions };
