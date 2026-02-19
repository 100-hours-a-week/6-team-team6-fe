"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupSettingsDto } from "@/features/group/schemas";
import {
	GroupSettingsResponseApiSchema,
	GroupSettingsResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

class GetGroupSettingsError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("GetGroupSettingsError", status, code);
	}
}

async function getGroupSettings(groupId: string): Promise<GroupSettingsDto> {
	const parsed = await requestJson(
		apiClient.get(`groups/${groupId}`),
		GroupSettingsResponseApiSchema,
		GetGroupSettingsError,
	);

	return GroupSettingsResponseDtoSchema.parse({
		groupId: parsed.groupId,
		groupName: parsed.groupName,
		groupCoverImageUrl: parsed.groupCoverImageUrl ?? null,
	});
}

export { getGroupSettings, GetGroupSettingsError };
