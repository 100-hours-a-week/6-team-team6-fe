"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupMembershipMeDto } from "@/features/group/schemas";
import {
	GroupMembershipMeResponseApiSchema,
	GroupMembershipMeResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

class GetMyGroupMembershipError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("GetMyGroupMembershipError", status, code);
	}
}

async function getMyGroupMembership(groupId: string): Promise<GroupMembershipMeDto> {
	const parsed = await requestJson(
		apiClient.get(`groups/${groupId}/membership/me`),
		GroupMembershipMeResponseApiSchema,
		GetMyGroupMembershipError,
	);

	return GroupMembershipMeResponseDtoSchema.parse({
		membershipId: parsed.membershipId,
		nickname: parsed.nickname,
	});
}

export { getMyGroupMembership, GetMyGroupMembershipError };
