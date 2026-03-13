"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

interface DeleteKeywordSubscriptionParams {
	groupId: string;
	keywordSubscriptionId: number;
}

class DeleteKeywordSubscriptionError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("DeleteKeywordSubscriptionError", status, code);
	}
}

async function deleteKeywordSubscription(params: DeleteKeywordSubscriptionParams): Promise<void> {
	const { groupId, keywordSubscriptionId } = params;

	await requestVoid(
		apiClient.delete(
			`groups/${groupId}/memberships/me/keyword-subscriptions/${keywordSubscriptionId}`,
		),
		DeleteKeywordSubscriptionError,
	);
}

export { deleteKeywordSubscription, DeleteKeywordSubscriptionError };
export type { DeleteKeywordSubscriptionParams };
