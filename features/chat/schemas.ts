import { z } from "zod";

const ChatRoomSummaryApiSchema = z.object({
	chatroomId: z.number(),
	chatPartnerId: z.number(),
	chatPartnerAvartUrl: z.string().min(1).optional(),
	chatPartnerAvatarUrl: z.string().min(1).optional(),
	chatPartnerNickname: z.string().min(1),
	groupId: z.number(),
	groupName: z.string().min(1),
	postId: z.number(),
	postFirstImageUrl: z.string().min(1),
	lastMessageAt: z.string().min(1),
	lastMessage: z.string().min(1),
	unreadCount: z.number().min(0),
});

const ChatRoomSummaryDtoSchema = z.object({
	chatRoomId: z.number(),
	chatPartnerId: z.number(),
	chatPartnerAvatarUrl: z.string().min(1),
	chatPartnerNickname: z.string().min(1),
	groupId: z.number(),
	groupName: z.string().min(1),
	postId: z.number(),
	postFirstImageUrl: z.string().min(1),
	lastMessageAt: z.string().min(1),
	lastMessage: z.string().min(1),
	unreadCount: z.number().min(0),
});

const ChatRoomSummariesApiSchema = z.array(ChatRoomSummaryApiSchema);
const ChatRoomSummariesDtoSchema = z.array(ChatRoomSummaryDtoSchema);

const CursorDtoSchema = z.object({
	cursor: z.string().nullable(),
	hasNext: z.boolean(),
});

const ChatroomIdResponseApiSchema = z.object({
	chatroomId: z.number(),
});

const ChatroomIdResponseDtoSchema = z.object({
	chatroomId: z.number(),
});

const ChatRoomsResponseApiSchema = z.union([
	z.object({
		chatroomSummaries: ChatRoomSummariesApiSchema,
		cursorDto: CursorDtoSchema,
	}),
	z.object({
		chatroomSummaries: ChatRoomSummariesApiSchema,
		nextCursor: z.string().nullable(),
		hasNext: z.boolean(),
	}),
]);

const ChatRoomsResponseDtoSchema = z.object({
	rooms: ChatRoomSummariesDtoSchema,
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

type ChatRoomSummaryDto = z.infer<typeof ChatRoomSummaryDtoSchema>;

type ChatRoomsResponseDto = z.infer<typeof ChatRoomsResponseDtoSchema>;
type ChatroomIdResponseDto = z.infer<typeof ChatroomIdResponseDtoSchema>;

export type { ChatroomIdResponseDto,ChatRoomsResponseDto, ChatRoomSummaryDto };
export {
	ChatroomIdResponseApiSchema,
	ChatroomIdResponseDtoSchema,
	ChatRoomsResponseApiSchema,
	ChatRoomsResponseDtoSchema,
	ChatRoomSummaryApiSchema,
	ChatRoomSummaryDtoSchema,
};
