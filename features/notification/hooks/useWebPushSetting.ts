"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationQueryKeys } from "@/features/notification/api";
import {
	getWebPushSetting,
	type GetWebPushSettingError,
	updateWebPushSetting,
	type UpdateWebPushSettingError,
} from "@/features/notification/api";
import type { WebPushSettingDto } from "@/features/notification/schemas";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

interface WebPushSettingState {
	isEnabled: boolean;
	isLoading: boolean;
	isUpdating: boolean;
}

interface WebPushSettingActions {
	toggleEnabled: (nextEnabled: boolean) => void;
}

interface UpdateContext {
	previousSetting?: WebPushSettingDto;
}

const NOTIFICATION_SETTINGS_MESSAGES = {
	loadFailed: "알림 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
	updateFailed: "알림 설정 변경에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

const resolveNotificationSettingErrorMessage = (error: unknown, fallbackMessage: string) => {
	const code = getApiErrorCode(error);
	return getApiErrorMessage(code) ?? fallbackMessage;
};

function useWebPushSetting(): {
	state: WebPushSettingState;
	actions: WebPushSettingActions;
} {
	const queryClient = useQueryClient();
	const queryKey = notificationQueryKeys.webPushSetting();

	const webPushSettingQuery = useQuery<WebPushSettingDto, GetWebPushSettingError>({
		queryKey,
		queryFn: () => getWebPushSetting(),
	});

	const { mutate: toggleEnabled, isPending: isUpdating } = useMutation<
		WebPushSettingDto,
		UpdateWebPushSettingError,
		boolean,
		UpdateContext
	>({
		mutationFn: (nextEnabled) => updateWebPushSetting({ enabled: nextEnabled }),
		onMutate: async (nextEnabled) => {
			await queryClient.cancelQueries({ queryKey });
			const previousSetting = queryClient.getQueryData<WebPushSettingDto>(queryKey);
			queryClient.setQueryData<WebPushSettingDto>(queryKey, { enabled: nextEnabled });
			return { previousSetting };
		},
		onError: (error, _nextEnabled, context) => {
			if (context?.previousSetting) {
				queryClient.setQueryData(queryKey, context.previousSetting);
			} else {
				void queryClient.invalidateQueries({ queryKey });
			}

			toast.error(
				resolveNotificationSettingErrorMessage(
					error,
					NOTIFICATION_SETTINGS_MESSAGES.updateFailed,
				),
			);
		},
		onSuccess: (data) => {
			queryClient.setQueryData<WebPushSettingDto>(queryKey, data);
		},
	});

	useEffect(() => {
		if (!webPushSettingQuery.error) {
			return;
		}

		toast.error(
			resolveNotificationSettingErrorMessage(
				webPushSettingQuery.error,
				NOTIFICATION_SETTINGS_MESSAGES.loadFailed,
			),
		);
	}, [webPushSettingQuery.error]);

	return {
		state: {
			isEnabled: webPushSettingQuery.data?.enabled ?? false,
			isLoading: webPushSettingQuery.isLoading,
			isUpdating,
		},
		actions: {
			toggleEnabled,
		},
	};
}

export { useWebPushSetting };
export type { WebPushSettingActions, WebPushSettingState };
