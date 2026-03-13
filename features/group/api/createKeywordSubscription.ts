"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { KeywordSubscriptionCreateDto } from "@/features/group/schemas";
import {
	KeywordSubscriptionCreateResponseApiSchema,
	KeywordSubscriptionCreateResponseDtoSchema,
} from "@/features/group/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

interface CreateKeywordSubscriptionParams {
	groupId: string;
	keyword: string;
}

class CreateKeywordSubscriptionError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("CreateKeywordSubscriptionError", status, code);
	}
}

async function createKeywordSubscription(
	params: CreateKeywordSubscriptionParams,
): Promise<KeywordSubscriptionCreateDto> {
	const { groupId, keyword } = params;

	const parsed = await requestJson(
		apiClient.post(`groups/${groupId}/memberships/me/keyword-subscriptions`, {
			json: { keyword },
		}),
		KeywordSubscriptionCreateResponseApiSchema,
		CreateKeywordSubscriptionError,
	);

	return KeywordSubscriptionCreateResponseDtoSchema.parse(parsed);
}

export { createKeywordSubscription, CreateKeywordSubscriptionError };
export type { CreateKeywordSubscriptionParams };
