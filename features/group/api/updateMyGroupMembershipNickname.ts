"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupMembershipNicknameUpdateDto } from "@/features/group/schemas";
import {
	GroupMembershipNicknameUpdateResponseApiSchema,
	GroupMembershipNicknameUpdateResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

interface UpdateMyGroupMembershipNicknameParams {
	groupId: string;
	nickname: string;
}

class UpdateMyGroupMembershipNicknameError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("UpdateMyGroupMembershipNicknameError", status, code);
	}
}

async function updateMyGroupMembershipNickname(
	params: UpdateMyGroupMembershipNicknameParams,
): Promise<GroupMembershipNicknameUpdateDto> {
	const { groupId, nickname } = params;

	const parsed = await requestJson(
		apiClient.patch(`groups/${groupId}/membership/me`, {
			json: {
				nickname,
			},
		}),
		GroupMembershipNicknameUpdateResponseApiSchema,
		UpdateMyGroupMembershipNicknameError,
	);

	return GroupMembershipNicknameUpdateResponseDtoSchema.parse({
		nickname: parsed.nickname,
	});
}

export {
	updateMyGroupMembershipNickname,
	UpdateMyGroupMembershipNicknameError,
};
export type { UpdateMyGroupMembershipNicknameParams };
