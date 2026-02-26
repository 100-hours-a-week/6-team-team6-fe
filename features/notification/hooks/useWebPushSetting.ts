"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationQueryKeys } from "@/features/notification/api";
import {
	deletePushToken,
	getWebPushSetting,
	type GetWebPushSettingError,
	registerPushToken,
	updateWebPushSetting,
} from "@/features/notification/api";
import {
	getCurrentNotificationPermission,
	requestNotificationPermission,
} from "@/features/notification/lib/requestNotificationPermission";
import type { WebPushSettingDto } from "@/features/notification/schemas";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import {
	getFirebaseMessagingServiceWorkerRegistration,
	getFirebaseMessagingToken,
	getFirebaseMessagingVapidKey,
} from "@/shared/lib/firebase-messaging";
import { getOrCreatePushDeviceId, getPushDeviceId } from "@/shared/lib/push-device";

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
	tokenDeleteFailed: "토큰 정리에 실패했어요. 잠시 후 다시 시도해 주세요.",
	notificationUnsupported: "이 디바이스 환경은 푸시 알림을 지원하지 않습니다.",
	notificationPermissionDenied: "알림 권한이 필요합니다.",
	vapidKeyMissing: "VAPID 키가 설정되지 않았어요.",
	deviceIdUnavailable: "디바이스 ID를 생성하지 못했어요.",
	tokenIssueFailed: "FCM 토큰 발급에 실패했어요.",
	permissionGrantedRetry: "권한이 허용되었어요. 알림 토글을 다시 켜주세요.",
	permissionStillDenied: "알림 권한이 허용되지 않았어요.",
	permissionDeniedGuide: "브라우저 또는 기기 설정에서 알림을 허용한 뒤 다시 시도해 주세요.",
};

const resolveNotificationSettingErrorMessage = (error: unknown, fallbackMessage: string) => {
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

const isPermissionDeniedError = (error: unknown) =>
	error instanceof Error &&
	error.message === NOTIFICATION_SETTINGS_MESSAGES.notificationPermissionDenied;

const showNotificationPermissionToast = () => {
	const permission = getCurrentNotificationPermission();

	if (permission === "default") {
		toast.error(NOTIFICATION_SETTINGS_MESSAGES.notificationPermissionDenied, {
			action: {
				label: "권한 허용",
				onClick: async () => {
					const nextPermission = await requestNotificationPermission();
					if (nextPermission === "unsupported") {
						toast.error(NOTIFICATION_SETTINGS_MESSAGES.notificationUnsupported);
						return;
					}

					if (nextPermission === "granted") {
						toast.success(NOTIFICATION_SETTINGS_MESSAGES.permissionGrantedRetry);
						return;
					}

					toast.error(NOTIFICATION_SETTINGS_MESSAGES.permissionStillDenied);
				},
			},
		});
		return;
	}

	toast.error(NOTIFICATION_SETTINGS_MESSAGES.notificationPermissionDenied, {
		description: NOTIFICATION_SETTINGS_MESSAGES.permissionDeniedGuide,
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
			throw new Error(NOTIFICATION_SETTINGS_MESSAGES.notificationUnsupported);
		}

		if (permission !== "granted") {
			throw new Error(NOTIFICATION_SETTINGS_MESSAGES.notificationPermissionDenied);
		}

		const vapidKey = getFirebaseMessagingVapidKey();
		if (!vapidKey) {
			throw new Error(NOTIFICATION_SETTINGS_MESSAGES.vapidKeyMissing);
		}

		const serviceWorkerRegistration = await getFirebaseMessagingServiceWorkerRegistration();
		const deviceId = getOrCreatePushDeviceId();

		if (!deviceId) {
			throw new Error(NOTIFICATION_SETTINGS_MESSAGES.deviceIdUnavailable);
		}

		const token = await getFirebaseMessagingToken({
			vapidKey,
			serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
		});

		if (!token) {
			throw new Error(NOTIFICATION_SETTINGS_MESSAGES.tokenIssueFailed);
		}

		await registerPushToken({
			platform: "WEB",
			deviceId,
			newToken: token,
		});

		return updateWebPushSetting({ enabled: true });
	};

	const disableWebPushSetting = async (): Promise<WebPushSettingDto> => {
		const updatedSetting = await updateWebPushSetting({ enabled: false });
		const deviceId = getPushDeviceId();

		if (deviceId) {
			try {
				await deletePushToken(deviceId);
			} catch (error) {
				toast.error(
					resolveNotificationSettingErrorMessage(
						error,
						NOTIFICATION_SETTINGS_MESSAGES.tokenDeleteFailed,
					),
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

			toast.error(
				resolveNotificationSettingErrorMessage(error, NOTIFICATION_SETTINGS_MESSAGES.updateFailed),
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
