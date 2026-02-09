"use client";

import type { ChatroomPostInfoDto } from "@/features/chat/schemas";
import {
	ChatroomPostInfoApiSchema,
	ChatroomPostInfoDtoSchema,
} from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetChatroomPostInfoParams = {
	postId: number;
	chatroomId: number;
};

class GetChatroomPostInfoError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetChatroomPostInfoError";
		this.status = status;
		this.code = code;
	}
}

async function getChatroomPostInfo(
	params: GetChatroomPostInfoParams,
): Promise<ChatroomPostInfoDto> {
	const { postId, chatroomId } = params;

	const parsed = await requestJson(
		apiClient.get(`posts/${postId}/chatrooms/${chatroomId}/post`),
		ChatroomPostInfoApiSchema,
		GetChatroomPostInfoError,
	);

	return ChatroomPostInfoDtoSchema.parse(parsed);
}

export type { GetChatroomPostInfoParams };
export { getChatroomPostInfo, GetChatroomPostInfoError };
