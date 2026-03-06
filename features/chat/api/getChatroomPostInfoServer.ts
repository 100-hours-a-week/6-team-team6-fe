import type { ChatroomPostIdResponseDto, ChatroomPostInfoDto } from "@/features/chat/schemas";
import {
	ChatroomPostIdResponseApiSchema,
	ChatroomPostIdResponseDtoSchema,
	ChatroomPostInfoApiSchema,
	ChatroomPostInfoDtoSchema,
} from "@/features/chat/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

type GetChatroomPostInfoServerParams = {
	chatroomId: number;
};

type ChatRoomHydrationData = {
	postId: ChatroomPostIdResponseDto["postId"];
	postInfo: ChatroomPostInfoDto;
};

class GetChatroomPostInfoServerError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetChatroomPostInfoServerError";
		this.status = status;
		this.code = code;
	}
}

async function getChatroomPostInfoServer(
	params: GetChatroomPostInfoServerParams,
): Promise<ChatRoomHydrationData> {
	const { chatroomId } = params;

	const rawPostId = await requestJson(
		apiServer.get(`chatrooms/${chatroomId}/post`, {
			throwHttpErrors: false,
			cache: "no-store",
		}),
		ChatroomPostIdResponseApiSchema,
		GetChatroomPostInfoServerError,
	);
	const postId = ChatroomPostIdResponseDtoSchema.parse(rawPostId).postId;

	const rawPostInfo = await requestJson(
		apiServer.get(`posts/${postId}/chatrooms/${chatroomId}/post`, {
			throwHttpErrors: false,
			cache: "no-store",
		}),
		ChatroomPostInfoApiSchema,
		GetChatroomPostInfoServerError,
	);
	const postInfo = ChatroomPostInfoDtoSchema.parse(rawPostInfo);

	return {
		postId,
		postInfo,
	};
}

export type { ChatRoomHydrationData, GetChatroomPostInfoServerParams };
export { getChatroomPostInfoServer, GetChatroomPostInfoServerError };
