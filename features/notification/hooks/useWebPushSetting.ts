"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationQueryKeys } from "@/features/notification/api";
import {
	deletePushToken,
	getWebPushSetting,
	type GetWebPushSettingError,
	updateWebPushSetting,
} from "@/features/notification/api";
import {
	notificationErrorMessages,
	notificationMessages,
} from "@/features/notification/lib/constants";
import { enableWebPush, type EnableWebPushResult } from "@/features/notification/lib/enableWebPush";
import {
	getCurrentNotificationPermission,
	requestNotificationPermission,
} from "@/features/notification/lib/requestNotificationPermission";
import { resolveNotificationErrorMessage } from "@/features/notification/lib/resolveNotificationErrorMessage";
import type { WebPushSettingDto } from "@/features/notification/schemas";

import { getPushDeviceId } from "@/shared/lib/push-device";

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

const isPermissionDeniedError = (error: unknown) =>
	error instanceof Error &&
	error.message === notificationErrorMessages.notificationPermissionDenied;

const resolveEnableWebPushFailureMessage = (result: EnableWebPushResult) => {
	switch (result) {
		case "unsupported":
			return notificationErrorMessages.notificationUnsupported;
		case "permission_denied":
			return notificationErrorMessages.notificationPermissionDenied;
		case "vapid_missing":
			return notificationErrorMessages.vapidKeyMissing;
		case "device_id_unavailable":
			return notificationErrorMessages.deviceIdUnavailable;
		case "token_issue_failed":
			return notificationErrorMessages.tokenIssueFailed;
		case "enabled":
		default:
			return null;
	}
};

const showNotificationPermissionToast = () => {
	const permission = getCurrentNotificationPermission();

	if (permission === "default") {
		toast.error(notificationErrorMessages.notificationPermissionDenied, {
			action: {
				label: notificationMessages.permissionActionLabel,
				onClick: async () => {
					const nextPermission = await requestNotificationPermission();
					if (nextPermission === "unsupported") {
						toast.error(notificationErrorMessages.notificationUnsupported);
						return;
					}

					if (nextPermission === "granted") {
						toast.success(notificationMessages.permissionGrantedRetry);
						return;
					}

					toast.error(notificationErrorMessages.permissionStillDenied);
				},
			},
		});
		return;
	}

	toast.error(notificationErrorMessages.notificationPermissionDenied, {
		description: notificationErrorMessages.permissionDeniedGuide,
	});
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

	const enableWebPushSetting = async (): Promise<WebPushSettingDto> => {
		const permission = await requestNotificationPermission();
		if (permission === "unsupported") {
			throw new Error(notificationErrorMessages.notificationUnsupported);
		}

		if (permission !== "granted") {
			throw new Error(notificationErrorMessages.notificationPermissionDenied);
		}

		const result = await enableWebPush();
		const failureMessage = resolveEnableWebPushFailureMessage(result);
		if (failureMessage) {
			throw new Error(failureMessage);
		}

		return { enabled: true };
	};

	const disableWebPushSetting = async (): Promise<WebPushSettingDto> => {
		const updatedSetting = await updateWebPushSetting({ enabled: false });
		const deviceId = getPushDeviceId();

		if (deviceId) {
			try {
				await deletePushToken(deviceId);
			} catch (error) {
				toast.error(
					resolveNotificationErrorMessage(error, notificationErrorMessages.tokenDeleteFailed),
				);
			}
		}

		return updatedSetting;
	};

	const { mutate: toggleEnabled, isPending: isUpdating } = useMutation<
		WebPushSettingDto,
		unknown,
		boolean,
		UpdateContext
	>({
		mutationFn: (nextEnabled) => (nextEnabled ? enableWebPushSetting() : disableWebPushSetting()),
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

			if (_nextEnabled && isPermissionDeniedError(error)) {
				showNotificationPermissionToast();
				return;
			}

			toast.error(resolveNotificationErrorMessage(error, notificationErrorMessages.updateSettings));
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
			resolveNotificationErrorMessage(
				webPushSettingQuery.error,
				notificationErrorMessages.loadSettings,
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
