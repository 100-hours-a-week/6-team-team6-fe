"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupCreateResponseDto } from "@/features/group/schemas";
import {
	GroupCreateResponseApiSchema,
	GroupCreateResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type CreateGroupParams = {
	groupName: string;
	groupCoverImageUrl: string;
};

class CreateGroupError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("CreateGroupError", status, code);
	}
}

async function createGroup(params: CreateGroupParams): Promise<GroupCreateResponseDto> {
	const { groupName, groupCoverImageUrl } = params;
	const formData = new FormData();

	formData.append("groupName", groupName);
	formData.append("groupCoverImageUrl", groupCoverImageUrl);

	const parsed = await requestJson(
		apiClient.post("groups", { body: formData }),
		GroupCreateResponseApiSchema,
		CreateGroupError,
	);

	return GroupCreateResponseDtoSchema.parse({
		groupId: parsed.groupId,
	});
}

export type { CreateGroupParams };
export { createGroup, CreateGroupError };
