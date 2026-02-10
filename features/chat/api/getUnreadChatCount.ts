"use client";

import type { UnreadChatCountResponseDto } from "@/features/chat/schemas";
import {
	UnreadChatCountResponseApiSchema,
	UnreadChatCountResponseDtoSchema,
} from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetUnreadChatCountParams = void;

class GetUnreadChatCountError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetUnreadChatCountError";
		this.status = status;
		this.code = code;
	}
}

async function getUnreadChatCount(
	_params?: GetUnreadChatCountParams,
): Promise<UnreadChatCountResponseDto> {
	const parsed = await requestJson(
		apiClient.get("users/me/chatrooms/unread-count"),
		UnreadChatCountResponseApiSchema,
		GetUnreadChatCountError,
	);

	return UnreadChatCountResponseDtoSchema.parse({
		// TODO: fix field name
		unreadChatMesageCount: parsed.unreadChatMesageCount,
	});
}

export type { GetUnreadChatCountParams };
export { getUnreadChatCount, GetUnreadChatCountError };
