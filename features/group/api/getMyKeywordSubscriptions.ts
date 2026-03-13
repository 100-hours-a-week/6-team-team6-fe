"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { KeywordSubscriptionsResponseDto } from "@/features/group/schemas";
import {
	KeywordSubscriptionsResponseApiSchema,
	KeywordSubscriptionsResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

class GetMyKeywordSubscriptionsError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("GetMyKeywordSubscriptionsError", status, code);
	}
}

async function getMyKeywordSubscriptions(groupId: string): Promise<KeywordSubscriptionsResponseDto> {
	const parsed = await requestJson(
		apiClient.get(`groups/${groupId}/memberships/me/keyword-subscriptions`),
		KeywordSubscriptionsResponseApiSchema,
		GetMyKeywordSubscriptionsError,
	);

	return KeywordSubscriptionsResponseDtoSchema.parse({
		keywordSubscriptions: parsed.keywordSubscriptions,
	});
}

export { getMyKeywordSubscriptions, GetMyKeywordSubscriptionsError };
