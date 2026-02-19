import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createGroupInvitation,
	type CreateGroupInvitationError,
} from "@/features/group/api/createGroupInvitation";
import {
	getGroupSettings,
	type GetGroupSettingsError,
} from "@/features/group/api/getGroupSettings";
import { getMyGroupMembership, type GetMyGroupMembershipError } from "@/features/group/api/getMyGroupMembership";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import { leaveGroup as leaveGroupApi, type LeaveGroupError } from "@/features/group/api/leaveGroup";
import {
	updateMyGroupMembershipNickname,
	type UpdateMyGroupMembershipNicknameError,
} from "@/features/group/api/updateMyGroupMembershipNickname";
import {
	createGroupInviteLink,
	getGroupCoverImageByGroupId,
	GROUP_SETTINGS_ERROR_CODES,
	GROUP_SETTINGS_LABELS,
	GROUP_SETTINGS_NICKNAME_MAX_LENGTH,
	GROUP_SETTINGS_NICKNAME_MIN_LENGTH,
} from "@/features/group/lib/groupSettings";
import { GROUP_QUERY_STALE_TIME_MS } from "@/features/group/lib/query";
import type {
	GroupInvitationCreateDto,
	GroupMembershipMeDto,
	GroupSettingsDto,
} from "@/features/group/schemas";

import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { normalizeImageSrcForNextImage } from "@/shared/lib/image-src";

interface UseGroupSettingsOptions {
	groupId: string;
	onLeaveGroupSuccess: () => void;
}

interface GroupSettingsState {
	groupName: string;
	groupCoverImageUrl: string;
	inviteLink: string;
	nickname: string;
	nicknameInput: string;
	nicknameError: string | null;
	isNicknameSubmitDisabled: boolean;
	isNicknameDrawerOpen: boolean;
	isInviteDrawerOpen: boolean;
	isLeaveDrawerOpen: boolean;
	isGroupLoading: boolean;
	isMembershipLoading: boolean;
	isInviteLinkLoading: boolean;
	isNicknameSubmitting: boolean;
	isLeavingGroup: boolean;
}

interface GroupSettingsActions {
	openNicknameDrawer: () => void;
	openInviteDrawer: () => void;
	openLeaveDrawer: () => void;
	setNicknameDrawerOpen: (open: boolean) => void;
	setInviteDrawerOpen: (open: boolean) => void;
	setLeaveDrawerOpen: (open: boolean) => void;
	changeNicknameInput: (nextValue: string) => void;
	submitNickname: () => void;
	copyInviteLink: () => Promise<void>;
	leaveGroup: () => void;
}

const resolveGroupSettingsErrorMessage = (error: unknown, fallbackMessage: string) => {
	const code = getApiErrorCode(error);

	if (code === GROUP_SETTINGS_ERROR_CODES.groupNotFound) {
		return "그룹을 찾을 수 없습니다.";
	}

	if (code === GROUP_SETTINGS_ERROR_CODES.notMembership) {
		return "그룹원이 아닙니다.";
	}

	return getApiErrorMessage(code) ?? fallbackMessage;
};

function useGroupSettings(options: UseGroupSettingsOptions): {
	state: GroupSettingsState;
	actions: GroupSettingsActions;
} {
	const { groupId, onLeaveGroupSuccess } = options;
	const queryClient = useQueryClient();
	const groupDetailQueryKey = groupQueryKeys.detail(groupId);
	const membershipQueryKey = groupQueryKeys.membershipMe(groupId);
	const invitationQueryKey = groupQueryKeys.invitation(groupId);
	const canFetch = Boolean(groupId);

	const [nicknameInput, setNicknameInput] = useState("");
	const [nicknameError, setNicknameError] = useState<string | null>(null);
	const [invitationToken, setInvitationToken] = useState<string | null>(() => {
		const cachedInvitation = queryClient.getQueryData<GroupInvitationCreateDto>(invitationQueryKey);
		return cachedInvitation?.invitationToken ?? null;
	});

	const [isNicknameDrawerOpen, setIsNicknameDrawerOpen] = useState(false);
	const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
	const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false);

	const groupDetailQuery = useQuery<GroupSettingsDto, GetGroupSettingsError>({
		queryKey: groupDetailQueryKey,
		queryFn: () => getGroupSettings(groupId),
		enabled: canFetch,
		staleTime: GROUP_QUERY_STALE_TIME_MS,
	});

	const membershipQuery = useQuery<GroupMembershipMeDto, GetMyGroupMembershipError>({
		queryKey: membershipQueryKey,
		queryFn: () => getMyGroupMembership(groupId),
		enabled: canFetch,
		staleTime: GROUP_QUERY_STALE_TIME_MS,
	});

	const { mutateAsync: createInvitationMutateAsync, isPending: isInviteLinkLoading } = useMutation<
		GroupInvitationCreateDto,
		CreateGroupInvitationError,
		void
	>({
		mutationFn: () => createGroupInvitation(groupId),
		onSuccess: (data) => {
			setInvitationToken(data.invitationToken);
			queryClient.setQueryData(invitationQueryKey, data);
		},
		onError: (error) => {
			toast.error(
				resolveGroupSettingsErrorMessage(error, GROUP_SETTINGS_LABELS.createInviteFailedToast),
			);
		},
	});

	const { mutate: updateNicknameMutate, isPending: isNicknameSubmitting } = useMutation<
		{ nickname: string },
		UpdateMyGroupMembershipNicknameError,
		string
	>({
		mutationFn: (nextNickname) =>
			updateMyGroupMembershipNickname({
				groupId,
				nickname: nextNickname,
			}),
		onSuccess: (data) => {
			queryClient.setQueryData<GroupMembershipMeDto | undefined>(membershipQueryKey, (previous) => {
				if (!previous) {
					return previous;
				}

				return {
					...previous,
					nickname: data.nickname,
				};
			});
			void queryClient.invalidateQueries({ queryKey: membershipQueryKey });
			setNicknameError(null);
			setIsNicknameDrawerOpen(false);
			toast.success(GROUP_SETTINGS_LABELS.nicknameUpdatedToast);
		},
		onError: (error) => {
			const code = getApiErrorCode(error);

			if (code === GROUP_SETTINGS_ERROR_CODES.invalidNickname) {
				setNicknameError(GROUP_SETTINGS_LABELS.nicknameLengthError);
				return;
			}
			if (typeof code === "string" && code.includes("DUPLICATE")) {
				setNicknameError(GROUP_SETTINGS_LABELS.nicknameDuplicatedError);
				return;
			}

			toast.error(
				resolveGroupSettingsErrorMessage(error, GROUP_SETTINGS_LABELS.updateNicknameFailedToast),
			);
		},
	});

	const { mutate: leaveGroupMutate, isPending: isLeavingGroup } = useMutation<
		void,
		LeaveGroupError,
		void
	>({
		mutationFn: () => leaveGroupApi(groupId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: groupQueryKeys.myGroups() });
			queryClient.removeQueries({ queryKey: groupDetailQueryKey });
			queryClient.removeQueries({ queryKey: membershipQueryKey });
			queryClient.removeQueries({ queryKey: invitationQueryKey });
			setIsLeaveDrawerOpen(false);
			toast.success(GROUP_SETTINGS_LABELS.leaveCompletedToast);
			onLeaveGroupSuccess();
		},
		onError: (error) => {
			toast.error(
				resolveGroupSettingsErrorMessage(error, GROUP_SETTINGS_LABELS.leaveFailedToast),
			);
		},
	});

	useEffect(() => {
		if (!groupDetailQuery.error) {
			return;
		}

		toast.error(
			resolveGroupSettingsErrorMessage(
				groupDetailQuery.error,
				GROUP_SETTINGS_LABELS.loadGroupFailedToast,
			),
		);
	}, [groupDetailQuery.error]);

	useEffect(() => {
		if (!membershipQuery.error) {
			return;
		}

		toast.error(
			resolveGroupSettingsErrorMessage(
				membershipQuery.error,
				GROUP_SETTINGS_LABELS.loadProfileFailedToast,
			),
		);
	}, [membershipQuery.error]);

	const fallbackGroupCoverImageUrl = useMemo(() => getGroupCoverImageByGroupId(groupId), [groupId]);
	const groupCoverImageUrl = useMemo(() => {
		const normalizedCoverImageUrl = normalizeImageSrcForNextImage(
			groupDetailQuery.data?.groupCoverImageUrl,
		);

		return normalizedCoverImageUrl ?? fallbackGroupCoverImageUrl;
	}, [fallbackGroupCoverImageUrl, groupDetailQuery.data?.groupCoverImageUrl]);

	const groupName = groupDetailQuery.data?.groupName ?? GROUP_SETTINGS_LABELS.groupNameFallback;
	const nickname = membershipQuery.data?.nickname ?? "";
	const inviteLink = useMemo(
		() => (invitationToken ? createGroupInviteLink(invitationToken) : ""),
		[invitationToken],
	);

	const isNicknameSubmitDisabled = useMemo(() => {
		const trimmedNicknameInput = nicknameInput.trim();
		return (
			trimmedNicknameInput.length === 0 ||
			trimmedNicknameInput === nickname ||
			isNicknameSubmitting
		);
	}, [nicknameInput, nickname, isNicknameSubmitting]);

	const ensureInvitationToken = useCallback(async () => {
		if (invitationToken) {
			return invitationToken;
		}

		try {
			const data = await createInvitationMutateAsync();
			return data.invitationToken;
		} catch {
			return null;
		}
	}, [createInvitationMutateAsync, invitationToken]);

	const openNicknameDrawer = useCallback(() => {
		setNicknameInput(nickname);
		setNicknameError(null);
		setIsNicknameDrawerOpen(true);
	}, [nickname]);

	const openInviteDrawer = useCallback(() => {
		setIsInviteDrawerOpen(true);
		void ensureInvitationToken();
	}, [ensureInvitationToken]);

	const openLeaveDrawer = useCallback(() => {
		setIsLeaveDrawerOpen(true);
	}, []);

	const changeNicknameInput = useCallback((nextValue: string) => {
		setNicknameInput(nextValue);
		setNicknameError(null);
	}, []);

	const submitNickname = useCallback(() => {
		const nextNickname = nicknameInput.trim();

		if (
			nextNickname.length < GROUP_SETTINGS_NICKNAME_MIN_LENGTH ||
			nextNickname.length > GROUP_SETTINGS_NICKNAME_MAX_LENGTH
		) {
			setNicknameError(GROUP_SETTINGS_LABELS.nicknameLengthError);
			return;
		}

		updateNicknameMutate(nextNickname);
	}, [nicknameInput, updateNicknameMutate]);

	const copyInviteLink = useCallback(async () => {
		const token = await ensureInvitationToken();

		if (!token) {
			return;
		}

		const linkToCopy = createGroupInviteLink(token);

		try {
			await navigator.clipboard.writeText(linkToCopy);
			toast.success(GROUP_SETTINGS_LABELS.inviteCopiedToast);
		} catch (error) {
			console.error(error);
			toast.error(GROUP_SETTINGS_LABELS.inviteCopyFailedToast);
		}
	}, [ensureInvitationToken]);

	const leaveGroup = useCallback(() => {
		leaveGroupMutate();
	}, [leaveGroupMutate]);

	return {
		state: {
			groupName,
			groupCoverImageUrl,
			inviteLink,
			nickname,
			nicknameInput,
			nicknameError,
			isNicknameSubmitDisabled,
			isNicknameDrawerOpen,
			isInviteDrawerOpen,
			isLeaveDrawerOpen,
			isGroupLoading: groupDetailQuery.isLoading,
			isMembershipLoading: membershipQuery.isLoading,
			isInviteLinkLoading,
			isNicknameSubmitting,
			isLeavingGroup,
		},
		actions: {
			openNicknameDrawer,
			openInviteDrawer,
			openLeaveDrawer,
			setNicknameDrawerOpen: setIsNicknameDrawerOpen,
			setInviteDrawerOpen: setIsInviteDrawerOpen,
			setLeaveDrawerOpen: setIsLeaveDrawerOpen,
			changeNicknameInput,
			submitNickname,
			copyInviteLink,
			leaveGroup,
		},
	};
}

export { useGroupSettings };
export type { GroupSettingsActions, GroupSettingsState, UseGroupSettingsOptions };
