import { notFound, redirect } from "next/navigation";

import {
	validateGroupInvitationServer,
	ValidateGroupInvitationServerError,
} from "@/features/group/api/validateGroupInvitationServer";
import { GROUP_INVITE_ERROR_CODES } from "@/features/group/lib/groupInvite";
import { groupRoutes } from "@/features/group/lib/groupRoutes";
import type { GroupInvitationValidateDto } from "@/features/group/schemas";
import { GroupInvitePage } from "@/features/group/screens/GroupInvitePage";

import StatusCodes from "@/shared/lib/api/status-codes";

interface GroupInviteRoutePageProps {
	params: Promise<{
		invitaionToken: string;
	}>;
}

export default async function Page(props: GroupInviteRoutePageProps) {
	const { invitaionToken } = await props.params;
	const invitationToken = invitaionToken.trim();

	if (!invitationToken) {
		notFound();
	}

	let status: "available" | "group-limit-reached" = "available";
	let groupInfo: GroupInvitationValidateDto | null = null;

	try {
		groupInfo = await validateGroupInvitationServer(invitationToken);
	} catch (error) {
		if (
			error instanceof ValidateGroupInvitationServerError &&
			error.status === StatusCodes.NOT_FOUND
		) {
			notFound();
		}

		if (
			error instanceof ValidateGroupInvitationServerError &&
			error.status === StatusCodes.CONFLICT &&
			error.code === GROUP_INVITE_ERROR_CODES.alreadyMembership
		) {
			redirect(groupRoutes.list());
		}

		const isGroupLimitReachedError =
			error instanceof ValidateGroupInvitationServerError &&
			error.status === StatusCodes.CONFLICT &&
			error.code === GROUP_INVITE_ERROR_CODES.groupLimitReached;

		if (isGroupLimitReachedError) {
			status = "group-limit-reached";
			groupInfo = error.invitation ?? null;
		} else {
			console.error("[GroupInvitePage SSR validation failed]", {
				invitationToken,
				error,
			});
			throw error;
		}
	}

	return (
		<GroupInvitePage status={status} groupInfo={groupInfo} invitationToken={invitationToken} />
	);
}
