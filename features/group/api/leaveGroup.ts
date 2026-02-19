"use client";

import { GroupApiError } from "@/features/group/api/groupApiError";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestVoid } from "@/shared/lib/api/request";

class LeaveGroupError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("LeaveGroupError", status, code);
	}
}

async function leaveGroup(groupId: string): Promise<void> {
	await requestVoid(apiClient.delete(`groups/${groupId}`), LeaveGroupError);
}

export { leaveGroup, LeaveGroupError };
