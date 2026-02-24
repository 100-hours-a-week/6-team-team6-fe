"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupInvitationCreateDto } from "@/features/group/schemas";
import {
	GroupInvitationCreateResponseApiSchema,
	GroupInvitationCreateResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

class CreateGroupInvitationError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("CreateGroupInvitationError", status, code);
	}
}

async function createGroupInvitation(groupId: string): Promise<GroupInvitationCreateDto> {
	const parsed = await requestJson(
		apiClient.post(`groups/${groupId}/invitations`),
		GroupInvitationCreateResponseApiSchema,
		CreateGroupInvitationError,
	);

	return GroupInvitationCreateResponseDtoSchema.parse({
		invitationToken: parsed.invitationToken,
	});
}

export { createGroupInvitation, CreateGroupInvitationError };
