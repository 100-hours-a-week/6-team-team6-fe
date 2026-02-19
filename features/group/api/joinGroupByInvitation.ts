"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupInvitationJoinDto } from "@/features/group/schemas";
import {
	GroupInvitationJoinRequestSchema,
	GroupInvitationJoinResponseApiSchema,
	GroupInvitationJoinResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

interface JoinGroupByInvitationParams {
	invitationToken: string;
	nickname: string;
}

class JoinGroupByInvitationError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("JoinGroupByInvitationError", status, code);
	}
}

async function joinGroupByInvitation(
	params: JoinGroupByInvitationParams,
): Promise<GroupInvitationJoinDto> {
	const { invitationToken, nickname } = params;
	const payload = GroupInvitationJoinRequestSchema.parse({ nickname });

	const parsed = await requestJson(
		apiClient.post(`invitations/${invitationToken}/memberships`, {
			json: payload,
		}),
		GroupInvitationJoinResponseApiSchema,
		JoinGroupByInvitationError,
	);

	return GroupInvitationJoinResponseDtoSchema.parse({
		membershipId: parsed.membershipId,
	});
}

export { joinGroupByInvitation, JoinGroupByInvitationError };
export type { JoinGroupByInvitationParams };
