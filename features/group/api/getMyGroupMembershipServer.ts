import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupMembershipMeDto } from "@/features/group/schemas";
import {
	GroupMembershipMeResponseApiSchema,
	GroupMembershipMeResponseDtoSchema,
} from "@/features/group/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

class GetMyGroupMembershipServerError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("GetMyGroupMembershipServerError", status, code);
	}
}

async function getMyGroupMembershipServer(groupId: string): Promise<GroupMembershipMeDto> {
	const parsed = await requestJson(
		apiServer.get(`groups/${groupId}/membership/me`, {
			throwHttpErrors: false,
			cache: "no-store",
		}),
		GroupMembershipMeResponseApiSchema,
		GetMyGroupMembershipServerError,
	);

	return GroupMembershipMeResponseDtoSchema.parse({
		membershipId: parsed.membershipId,
		nickname: parsed.nickname,
	});
}

export { getMyGroupMembershipServer, GetMyGroupMembershipServerError };
