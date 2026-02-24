"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { KeyboardEvent } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
	joinGroupByInvitation,
	type JoinGroupByInvitationError,
} from "@/features/group/api/joinGroupByInvitation";
import {
	GROUP_INVITE_ERROR_CODES,
	GROUP_INVITE_LABELS,
} from "@/features/group/lib/groupInvite";
import { groupRoutes } from "@/features/group/lib/groupRoutes";
import {
	type GroupInvitationJoinDto,
	GroupInvitationJoinFormSchema,
	type GroupInvitationJoinFormValues,
} from "@/features/group/schemas";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";

interface UseGroupInviteOptions {
	groupId: number | null;
	invitationToken: string;
	isGroupLimitReached: boolean;
}

interface GroupInviteState {
	form: UseFormReturn<GroupInvitationJoinFormValues>;
	isJoining: boolean;
}

interface GroupInviteActions {
	closePage: () => void;
	preventNicknameSpaceKey: (event: KeyboardEvent<HTMLInputElement>) => void;
	submitGroupJoin: (values: GroupInvitationJoinFormValues) => void;
}

const resolveGroupPostsHref = (groupId: number | null) =>
	typeof groupId === "number" ? groupRoutes.posts(groupId) : groupRoutes.list();

function useGroupInvite(options: UseGroupInviteOptions): {
	state: GroupInviteState;
	actions: GroupInviteActions;
} {
	const { groupId, invitationToken, isGroupLimitReached } = options;
	const router = useRouter();

	const form = useForm<GroupInvitationJoinFormValues>({
		resolver: zodResolver(GroupInvitationJoinFormSchema),
		defaultValues: {
			nickname: "",
		},
		mode: "onSubmit",
		reValidateMode: "onSubmit",
	});

	const { setError } = form;

	const { mutate, isPending: isJoining } = useMutation<
		GroupInvitationJoinDto,
		JoinGroupByInvitationError,
		GroupInvitationJoinFormValues
	>({
		mutationFn: ({ nickname }) =>
			joinGroupByInvitation({
				invitationToken,
				nickname,
			}),
		onSuccess: () => {
			router.replace(resolveGroupPostsHref(groupId));
		},
		onError: (error) => {
			const errorCode = getApiErrorCode(error);

			if (errorCode === GROUP_INVITE_ERROR_CODES.invalidNickname) {
				setError("nickname", {
					type: "manual",
					message: GROUP_INVITE_LABELS.nicknameLengthError,
				});
				return;
			}

			if (errorCode === GROUP_INVITE_ERROR_CODES.groupLimitReached) {
				toast.error(GROUP_INVITE_LABELS.groupLimitReachedToast);
				return;
			}

			if (errorCode === GROUP_INVITE_ERROR_CODES.alreadyMembership) {
				router.replace(resolveGroupPostsHref(groupId));
				return;
			}

			if (errorCode === GROUP_INVITE_ERROR_CODES.groupNotFound) {
				router.replace(groupRoutes.list());
				return;
			}

			toast.error(GROUP_INVITE_LABELS.joinFailedToast);
		},
	});

	const closePage = useCallback(() => {
		router.replace(groupRoutes.list());
	}, [router]);

	const preventNicknameSpaceKey = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === " ") {
				event.preventDefault();
			}
		},
		[],
	);

	const submitGroupJoin = useCallback(
		(values: GroupInvitationJoinFormValues) => {
			if (isGroupLimitReached) {
				toast.error(GROUP_INVITE_LABELS.groupLimitReachedToast);
				return;
			}

			mutate(values);
		},
		[isGroupLimitReached, mutate],
	);

	return {
		state: {
			form,
			isJoining,
		},
		actions: {
			closePage,
			preventNicknameSpaceKey,
			submitGroupJoin,
		},
	};
}

export type { GroupInviteActions, GroupInviteState, UseGroupInviteOptions };
export { useGroupInvite };
