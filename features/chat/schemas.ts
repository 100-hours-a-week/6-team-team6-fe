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

const ChatMessageSendResponseApiSchema = z.object({
	messageId: z.string().min(1),
});

const ChatMessageSendResponseDtoSchema = z.object({
	messageId: z.string().min(1),
});

const ChatroomPostIdResponseApiSchema = z.object({
	postId: z.number(),
});

const ChatroomPostIdResponseDtoSchema = z.object({
	postId: z.number(),
});

const feeUnitSchema = z.enum(["HOUR", "DAY"]);
const rentalStatusSchema = z.enum(["AVAILABLE", "RENTED_OUT"]);

const ChatroomPostInfoApiSchema = z.object({
	partnerId: z.number(),
	partnerNickname: z.string().min(1),
	groupId: z.number(),
	groupName: z.string().min(1),
	postId: z.number(),
	postTitle: z.string().min(1),
	postFirstImageUrl: z.string().min(1),
	rentalFee: z.number().min(0),
	feeUnit: feeUnitSchema,
	rentalStatus: rentalStatusSchema,
});

const ChatroomPostInfoDtoSchema = z.object({
	partnerId: z.number(),
	partnerNickname: z.string().min(1),
	groupId: z.number(),
	groupName: z.string().min(1),
	postId: z.number(),
	postTitle: z.string().min(1),
	postFirstImageUrl: z.string().min(1),
	rentalFee: z.number().min(0),
	feeUnit: feeUnitSchema,
	rentalStatus: rentalStatusSchema,
});

const ChatMessageApiSchema = z.object({
	messageId: z.string().min(1),
	who: z.enum(["me", "partner"]),
	message: z.string().min(1),
	createdAt: z.string().min(1),
});

const ChatMessageDtoSchema = z.object({
	messageId: z.string().min(1),
	who: z.enum(["me", "partner"]),
	message: z.string().min(1),
	createdAt: z.string().min(1),
});

const ChatMessagesResponseApiSchema = z.union([
	z.object({
		chatroomId: z.number(),
		messageItems: z.array(ChatMessageApiSchema),
		cursorDto: CursorDtoSchema,
	}),
	z.object({
		chatroomId: z.number(),
		chatMessages: z.array(ChatMessageApiSchema),
		nextCursor: z.string().nullable(),
		hasNext: z.boolean(),
	}),
]);

const ChatMessagesResponseDtoSchema = z.object({
	chatroomId: z.number(),
	messages: z.array(ChatMessageDtoSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

// TODO fix field name
const UnreadChatCountResponseApiSchema = z.object({
	unreadChatMesageCount: z.number().min(0),
});

const UnreadChatCountResponseDtoSchema = z.object({
	unreadChatMesageCount: z.number().min(0),
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
type ChatMessageSendResponseDto = z.infer<typeof ChatMessageSendResponseDtoSchema>;
type ChatroomPostIdResponseDto = z.infer<typeof ChatroomPostIdResponseDtoSchema>;
type ChatroomPostInfoDto = z.infer<typeof ChatroomPostInfoDtoSchema>;
type ChatMessageDto = z.infer<typeof ChatMessageDtoSchema>;
type ChatMessagesResponseDto = z.infer<typeof ChatMessagesResponseDtoSchema>;
type UnreadChatCountResponseDto = z.infer<typeof UnreadChatCountResponseDtoSchema>;

export type {
	ChatMessageDto,
	ChatMessageSendResponseDto,
	ChatMessagesResponseDto,
	ChatroomIdResponseDto,
	ChatroomPostIdResponseDto,
	ChatroomPostInfoDto,
	ChatRoomsResponseDto,
	ChatRoomSummaryDto,
	UnreadChatCountResponseDto,
};
export {
	ChatMessageApiSchema,
	ChatMessageDtoSchema,
	ChatMessageSendResponseApiSchema,
	ChatMessageSendResponseDtoSchema,
	ChatMessagesResponseApiSchema,
	ChatMessagesResponseDtoSchema,
	ChatroomIdResponseApiSchema,
	ChatroomIdResponseDtoSchema,
	ChatroomPostIdResponseApiSchema,
	ChatroomPostIdResponseDtoSchema,
	ChatroomPostInfoApiSchema,
	ChatroomPostInfoDtoSchema,
	ChatRoomsResponseApiSchema,
	ChatRoomsResponseDtoSchema,
	ChatRoomSummaryApiSchema,
	ChatRoomSummaryDtoSchema,
	UnreadChatCountResponseApiSchema,
	UnreadChatCountResponseDtoSchema,
};
