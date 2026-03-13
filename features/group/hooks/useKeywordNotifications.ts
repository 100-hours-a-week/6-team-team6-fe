"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createKeywordSubscription,
	type CreateKeywordSubscriptionError,
} from "@/features/group/api/createKeywordSubscription";
import {
	deleteKeywordSubscription,
	type DeleteKeywordSubscriptionError,
} from "@/features/group/api/deleteKeywordSubscription";
import { getMyKeywordSubscriptions } from "@/features/group/api/getMyKeywordSubscriptions";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import { GROUP_QUERY_STALE_TIME_MS } from "@/features/group/lib/query";
import type { KeywordSubscriptionSummaryDto } from "@/features/group/schemas";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

const KEYWORD_INPUT_MIN_LENGTH = 2;
const KEYWORD_INPUT_MAX_LENGTH = 30;

const KEYWORD_NOTIFICATION_MESSAGES = {
	title: "키워드 알림 설정",
	inputPlaceholder: "알림 받을 키워드를 입력해 주세요.",
	inputGuide: "2~30자 키워드를 등록하면 이 그룹의 관련 게시글 알림을 받을 수 있어요.",
	inputLengthError: "키워드는 2~30자 이내로 입력해 주세요.",
	addButton: "등록",
	addSuccess: "키워드를 등록했어요.",
	addFailed: "키워드 등록에 실패했어요. 잠시 후 다시 시도해 주세요.",
	deleteFailed: "키워드 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",
	loadFailed: "키워드 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
	empty: "아직 등록된 키워드가 없어요.\n키워드를 등록해 보세요",
	listTitle: "등록한 키워드",
	deleteAction: "삭제",
};

type KeywordNotificationsState = {
	keywordInput: string;
	keywordError: string | null;
	subscriptions: KeywordSubscriptionSummaryDto[];
	isLoading: boolean;
	isError: boolean;
	isCreating: boolean;
	isDeleting: boolean;
};

type KeywordNotificationsActions = {
	changeKeywordInput: (value: string) => void;
	submitKeyword: () => void;
	deleteKeyword: (keywordSubscriptionId: number) => void;
};

const resolveKeywordNotificationErrorMessage = (error: unknown, fallbackMessage: string) => {
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

function useKeywordNotifications(groupId: string): {
	state: KeywordNotificationsState;
	actions: KeywordNotificationsActions;
	labels: typeof KEYWORD_NOTIFICATION_MESSAGES;
} {
	const queryClient = useQueryClient();
	const queryKey = groupQueryKeys.keywordSubscriptions(groupId);
	const [keywordInput, setKeywordInput] = useState("");
	const [keywordError, setKeywordError] = useState<string | null>(null);

	const subscriptionsQuery = useQuery({
		queryKey,
		queryFn: () => getMyKeywordSubscriptions(groupId),
		enabled: Boolean(groupId),
		staleTime: GROUP_QUERY_STALE_TIME_MS,
	});

	const subscriptions = useMemo(
		() => subscriptionsQuery.data?.keywordSubscriptions ?? [],
		[subscriptionsQuery.data],
	);

	const { mutate: createKeywordMutate, isPending: isCreating } = useMutation<
		unknown,
		CreateKeywordSubscriptionError,
		string
	>({
		mutationFn: (keyword) => createKeywordSubscription({ groupId, keyword }),
		onSuccess: async () => {
			setKeywordInput("");
			setKeywordError(null);
			await queryClient.invalidateQueries({ queryKey });
			toast.success(KEYWORD_NOTIFICATION_MESSAGES.addSuccess);
		},
		onError: (error) => {
			toast.error(
				resolveKeywordNotificationErrorMessage(error, KEYWORD_NOTIFICATION_MESSAGES.addFailed),
			);
		},
	});

	const { mutate: deleteKeywordMutate, isPending: isDeleting } = useMutation<
		void,
		DeleteKeywordSubscriptionError,
		number
	>({
		mutationFn: (keywordSubscriptionId) =>
			deleteKeywordSubscription({ groupId, keywordSubscriptionId }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey });
		},
		onError: (error) => {
			toast.error(
				resolveKeywordNotificationErrorMessage(error, KEYWORD_NOTIFICATION_MESSAGES.deleteFailed),
			);
		},
	});

	useEffect(() => {
		if (!subscriptionsQuery.error) {
			return;
		}

		toast.error(
			resolveKeywordNotificationErrorMessage(
				subscriptionsQuery.error,
				KEYWORD_NOTIFICATION_MESSAGES.loadFailed,
			),
		);
	}, [subscriptionsQuery.error]);

	const changeKeywordInput = useCallback(
		(value: string) => {
			setKeywordInput(value);
			if (keywordError) {
				setKeywordError(null);
			}
		},
		[keywordError],
	);

	const submitKeyword = useCallback(() => {
		const trimmedKeyword = keywordInput.trim();

		if (
			trimmedKeyword.length < KEYWORD_INPUT_MIN_LENGTH ||
			trimmedKeyword.length > KEYWORD_INPUT_MAX_LENGTH
		) {
			setKeywordError(KEYWORD_NOTIFICATION_MESSAGES.inputLengthError);
			return;
		}

		createKeywordMutate(trimmedKeyword);
	}, [createKeywordMutate, keywordInput]);

	const deleteKeyword = useCallback(
		(keywordSubscriptionId: number) => {
			deleteKeywordMutate(keywordSubscriptionId);
		},
		[deleteKeywordMutate],
	);

	return {
		state: {
			keywordInput,
			keywordError,
			subscriptions,
			isLoading: subscriptionsQuery.isLoading,
			isError: subscriptionsQuery.isError,
			isCreating,
			isDeleting,
		},
		actions: {
			changeKeywordInput,
			submitKeyword,
			deleteKeyword,
		},
		labels: KEYWORD_NOTIFICATION_MESSAGES,
	};
}

export { useKeywordNotifications };
export type { KeywordNotificationsActions, KeywordNotificationsState };
