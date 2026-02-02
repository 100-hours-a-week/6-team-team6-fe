"use client";

import type { ChatroomPostIdResponseDto } from "@/features/chat/schemas";
import {
	ChatroomPostIdResponseApiSchema,
	ChatroomPostIdResponseDtoSchema,
} from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

type GetChatroomPostIdParams = {
	chatroomId: number;
};

class GetChatroomPostIdError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetChatroomPostIdError";
		this.status = status;
		this.code = code;
	}
}

async function getChatroomPostId(
	params: GetChatroomPostIdParams,
): Promise<ChatroomPostIdResponseDto> {
	const { chatroomId } = params;

	const parsed = await request(
		apiClient.get(`chatrooms/${chatroomId}/post`),
		ChatroomPostIdResponseApiSchema,
		GetChatroomPostIdError,
	);

	return ChatroomPostIdResponseDtoSchema.parse({ postId: parsed.postId });
}

export type { GetChatroomPostIdParams };
export { getChatroomPostId, GetChatroomPostIdError };
