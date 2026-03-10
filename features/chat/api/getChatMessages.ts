"use client";

import type { ChatMessagesResponseDto } from "@/features/chat/schemas";
import {
	ChatMessagesResponseApiSchema,
	ChatMessagesResponseDtoSchema,
} from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetChatMessagesParams = {
	postId: number;
	chatroomId: string;
	cursor?: string;
};

class GetChatMessagesError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetChatMessagesError";
		this.status = status;
		this.code = code;
	}
}

async function getChatMessages(params: GetChatMessagesParams): Promise<ChatMessagesResponseDto> {
	const { postId, chatroomId, cursor } = params;
	const searchParams = cursor ? { cursor } : undefined;

	const parsed = await requestJson(
		apiClient.get(`posts/${postId}/chatrooms/${chatroomId}/messages`, { searchParams }),
		ChatMessagesResponseApiSchema,
		GetChatMessagesError,
	);

	return ChatMessagesResponseDtoSchema.parse({
		chatroomId: parsed.chatroomId,
		messages: parsed.messageItems,
		nextCursor: parsed.cursorDto.cursor,
		hasNextPage: parsed.cursorDto.hasNext,
	});
}

export type { GetChatMessagesParams };
export { getChatMessages, GetChatMessagesError };
