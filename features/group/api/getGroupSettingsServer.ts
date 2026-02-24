import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupSettingsDto } from "@/features/group/schemas";
import {
	GroupSettingsResponseApiSchema,
	GroupSettingsResponseDtoSchema,
} from "@/features/group/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

class GetGroupSettingsServerError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("GetGroupSettingsServerError", status, code);
	}
}

async function getGroupSettingsServer(groupId: string): Promise<GroupSettingsDto> {
	const parsed = await requestJson(
		apiServer.get(`groups/${groupId}`, {
			throwHttpErrors: false,
			cache: "no-store",
		}),
		GroupSettingsResponseApiSchema,
		GetGroupSettingsServerError,
	);

	return GroupSettingsResponseDtoSchema.parse({
		groupId: parsed.groupId,
		groupName: parsed.groupName,
		groupCoverImageUrl: parsed.groupCoverImageUrl ?? null,
	});
}

export { getGroupSettingsServer, GetGroupSettingsServerError };
