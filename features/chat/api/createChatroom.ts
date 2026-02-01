"use client";

import type { ChatroomIdResponseDto } from "@/features/chat/schemas";
import {
	ChatroomIdResponseApiSchema,
	ChatroomIdResponseDtoSchema,
} from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

type CreateChatroomParams = {
	postId: number;
};

class CreateChatroomError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "CreateChatroomError";
		this.status = status;
		this.code = code;
	}
}

async function createChatroom(params: CreateChatroomParams): Promise<ChatroomIdResponseDto> {
	const { postId } = params;

	const parsed = await request(
		apiClient.post(`posts/${postId}/chatrooms`),
		ChatroomIdResponseApiSchema,
		CreateChatroomError,
	);

	return ChatroomIdResponseDtoSchema.parse({ chatroomId: parsed.chatroomId });
}

export type { CreateChatroomParams };
export { createChatroom, CreateChatroomError };
