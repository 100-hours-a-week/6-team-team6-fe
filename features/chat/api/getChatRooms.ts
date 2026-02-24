"use client";

import type { ChatRoomsResponseDto } from "@/features/chat/schemas";
import { ChatRoomsResponseApiSchema, ChatRoomsResponseDtoSchema } from "@/features/chat/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { requestJson } from "@/shared/lib/api/request";

type GetChatRoomsParams = {
	cursor?: string;
	postId?: number;
	listType?: "all" | "item";
};

class ChatRoomsError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "ChatRoomsError";
		this.status = status;
		this.code = code;
	}
}

async function getChatRooms(params: GetChatRoomsParams): Promise<ChatRoomsResponseDto> {
	const { cursor, postId, listType = "all" } = params;
	const searchParams = cursor ? { cursor } : undefined;
	const endpoint =
		listType === "item" && typeof postId === "number"
			? `users/me/posts/${postId}/chatrooms`
			: "users/me/chatrooms";

	const parsed = await requestJson(
		apiClient.get(endpoint, { searchParams }),
		ChatRoomsResponseApiSchema,
		ChatRoomsError,
	);

	const cursorDto =
		"cursorDto" in parsed
			? parsed.cursorDto
			: {
					cursor: parsed.nextCursor,
					hasNext: parsed.hasNext,
				};

	const rooms = parsed.chatroomSummaries.map((summary) => {
		const avatarUrl = summary.chatPartnerAvatarUrl ?? summary.chatPartnerAvartUrl;
		return {
			chatRoomId: summary.chatroomId,
			chatPartnerId: summary.chatPartnerId,
			chatPartnerAvatarUrl: avatarUrl ?? "",
			chatPartnerNickname: summary.chatPartnerNickname,
			groupId: summary.groupId,
			groupName: summary.groupName,
			postId: summary.postId,
			postFirstImageUrl: summary.postFirstImageUrl,
			lastMessageAt: summary.lastMessageAt,
			lastMessage: summary.lastMessage,
			unreadCount: summary.unreadCount,
		};
	});

	return ChatRoomsResponseDtoSchema.parse({
		rooms,
		nextCursor: cursorDto.cursor,
		hasNextPage: cursorDto.hasNext,
	});
}

export type { GetChatRoomsParams };
export { ChatRoomsError, getChatRooms };
