import { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import {
	createGroupInviteLink,
	getGroupCoverImageByGroupId,
	GROUP_SETTINGS_DUPLICATED_NICKNAMES,
	GROUP_SETTINGS_LABELS,
	GROUP_SETTINGS_NICKNAME_MAX_LENGTH,
	GROUP_SETTINGS_NICKNAME_MIN_LENGTH,
} from "@/features/group/lib/groupSettings";

interface UseGroupSettingsOptions {
	groupId: string;
	onLeaveGroupSuccess: () => void;
}

interface GroupSettingsState {
	groupCoverImageUrl: string;
	inviteLink: string;
	nickname: string;
	nicknameInput: string;
	nicknameError: string | null;
	isNicknameSubmitDisabled: boolean;
	isNicknameDrawerOpen: boolean;
	isInviteDrawerOpen: boolean;
	isLeaveDrawerOpen: boolean;
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

const duplicatedNicknameSet = new Set<string>(GROUP_SETTINGS_DUPLICATED_NICKNAMES);

function useGroupSettings(options: UseGroupSettingsOptions): {
	state: GroupSettingsState;
	actions: GroupSettingsActions;
} {
	const { groupId, onLeaveGroupSuccess } = options;

	const [nickname, setNickname] = useState("성훈");
	const [nicknameInput, setNicknameInput] = useState("성훈");
	const [nicknameError, setNicknameError] = useState<string | null>(null);

	const [isNicknameDrawerOpen, setIsNicknameDrawerOpen] = useState(false);
	const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
	const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false);

	const groupCoverImageUrl = useMemo(() => getGroupCoverImageByGroupId(groupId), [groupId]);
	const inviteLink = useMemo(() => createGroupInviteLink(groupId), [groupId]);

	const isNicknameSubmitDisabled = useMemo(() => {
		const trimmedNicknameInput = nicknameInput.trim();
		return trimmedNicknameInput.length === 0 || trimmedNicknameInput === nickname;
	}, [nicknameInput, nickname]);

	const openNicknameDrawer = useCallback(() => {
		setNicknameInput(nickname);
		setNicknameError(null);
		setIsNicknameDrawerOpen(true);
	}, [nickname]);

	const openInviteDrawer = useCallback(() => {
		setIsInviteDrawerOpen(true);
	}, []);

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

		if (duplicatedNicknameSet.has(nextNickname) && nextNickname !== nickname) {
			setNicknameError(GROUP_SETTINGS_LABELS.nicknameDuplicatedError);
			return;
		}

		setNickname(nextNickname);
		setNicknameInput(nextNickname);
		setNicknameError(null);
		setIsNicknameDrawerOpen(false);
		toast.success(GROUP_SETTINGS_LABELS.nicknameUpdatedToast);
	}, [nicknameInput, nickname]);

	const copyInviteLink = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			toast.success(GROUP_SETTINGS_LABELS.inviteCopiedToast);
		} catch (error) {
			console.error(error);
			toast.error(GROUP_SETTINGS_LABELS.inviteCopyFailedToast);
		}
	}, [inviteLink]);

	const leaveGroup = useCallback(() => {
		setIsLeaveDrawerOpen(false);
		toast.success(GROUP_SETTINGS_LABELS.leaveCompletedToast);
		onLeaveGroupSuccess();
	}, [onLeaveGroupSuccess]);

	return {
		state: {
			groupCoverImageUrl,
			inviteLink,
			nickname,
			nicknameInput,
			nicknameError,
			isNicknameSubmitDisabled,
			isNicknameDrawerOpen,
			isInviteDrawerOpen,
			isLeaveDrawerOpen,
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
