"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { MyGroupsResponseDto } from "@/features/group/schemas";
import {
	MyGroupsResponseApiSchema,
	MyGroupsResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

class MyGroupsError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("MyGroupsError", status, code);
	}
}

async function getMyGroups(): Promise<MyGroupsResponseDto> {
	const parsed = await requestJson(
		apiClient.get("users/me/groups"),
		MyGroupsResponseApiSchema,
		MyGroupsError,
	);

	return MyGroupsResponseDtoSchema.parse({
		totalCount: parsed.totalCount,
		groups: parsed.groupSummaries,
	});
}

export { getMyGroups, MyGroupsError };
