"use client";

import { GroupInviteView } from "@/features/group/components/GroupInviteView";
import { useGroupInvite } from "@/features/group/hooks/useGroupInvite";
import { GROUP_INVITE_LABELS } from "@/features/group/lib/groupInvite";
import type { GroupInvitationValidateDto } from "@/features/group/schemas";

interface GroupInvitePageProps {
	groupInfo: GroupInvitationValidateDto | null;
	invitationToken: string;
	status: "available" | "group-limit-reached";
}

function GroupInvitePage(props: GroupInvitePageProps) {
	const { groupInfo, invitationToken, status } = props;
	const isGroupLimitReached = status === "group-limit-reached";
	const { state, actions } = useGroupInvite({
		groupId: groupInfo?.groupId ?? null,
		invitationToken,
		isGroupLimitReached,
	});

	return (
		<GroupInviteView
			form={state.form}
			groupCoverImageUrl={groupInfo?.groupCoverImageUrl ?? null}
			groupName={groupInfo?.groupName ?? GROUP_INVITE_LABELS.groupNameFallback}
			isJoining={state.isJoining}
			onClose={actions.closePage}
			onNicknameKeyDown={actions.preventNicknameSpaceKey}
			onSubmit={actions.submitGroupJoin}
		/>
	);
}

export { GroupInvitePage };
export type { GroupInvitePageProps };
