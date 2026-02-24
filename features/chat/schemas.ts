import { z } from "zod";

const nonEmptyString = z.string().min(1);
const nonNegativeNumber = z.number().min(0);

const chatRoomSummarySharedShape = {
	chatPartnerId: z.number(),
	chatPartnerNickname: nonEmptyString,
	groupId: z.number(),
	groupName: nonEmptyString,
	postId: z.number(),
	postFirstImageUrl: nonEmptyString,
	lastMessageAt: nonEmptyString,
	lastMessage: nonEmptyString,
	unreadCount: nonNegativeNumber,
};

const ChatRoomSummaryApiSchema = z.object({
	chatroomId: z.number(),
	chatPartnerAvartUrl: nonEmptyString.optional(),
	chatPartnerAvatarUrl: nonEmptyString.optional(),
	...chatRoomSummarySharedShape,
});

const ChatRoomSummaryDtoSchema = z.object({
	chatRoomId: z.number(),
	chatPartnerAvatarUrl: nonEmptyString,
	...chatRoomSummarySharedShape,
});

const ChatRoomSummariesApiSchema = z.array(ChatRoomSummaryApiSchema);
const ChatRoomSummariesDtoSchema = z.array(ChatRoomSummaryDtoSchema);

const CursorDtoSchema = z.object({
	cursor: z.string().nullable(),
	hasNext: z.boolean(),
});

const ChatroomIdResponseSchema = z.object({
	chatroomId: z.number(),
});
const ChatroomIdResponseApiSchema = ChatroomIdResponseSchema;
const ChatroomIdResponseDtoSchema = ChatroomIdResponseSchema;

const ChatMessageSendResponseSchema = z.object({
	messageId: nonEmptyString,
});
const ChatMessageSendResponseApiSchema = ChatMessageSendResponseSchema;
const ChatMessageSendResponseDtoSchema = ChatMessageSendResponseSchema;

const ChatSendAckResponseSchema = z.object({
	chatroomId: z.number(),
	membershipId: z.number(),
	messageId: nonEmptyString,
	messageContent: nonEmptyString,
	createdAt: nonEmptyString,
});

const ChatroomPostIdResponseSchema = z.object({
	postId: z.number(),
});
const ChatroomPostIdResponseApiSchema = ChatroomPostIdResponseSchema;
const ChatroomPostIdResponseDtoSchema = ChatroomPostIdResponseSchema;

const feeUnitSchema = z.enum(["HOUR", "DAY"]);
const rentalStatusSchema = z.enum(["AVAILABLE", "RENTED_OUT"]);

const ChatroomPostInfoSchema = z.object({
	partnerId: z.number(),
	partnerNickname: z.string(),
	groupId: z.number(),
	groupName: nonEmptyString,
	postId: z.number(),
	postTitle: nonEmptyString,
	postFirstImageUrl: nonEmptyString,
	rentalFee: nonNegativeNumber,
	feeUnit: feeUnitSchema,
	rentalStatus: rentalStatusSchema,
});
const ChatroomPostInfoApiSchema = ChatroomPostInfoSchema;
const ChatroomPostInfoDtoSchema = ChatroomPostInfoSchema;

const ChatMessageSchema = z.object({
	messageId: nonEmptyString,
	who: z.enum(["me", "partner"]),
	message: nonEmptyString,
	createdAt: nonEmptyString,
});
const ChatMessageApiSchema = ChatMessageSchema;
const ChatMessageDtoSchema = ChatMessageSchema;

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
const UnreadChatCountResponseSchema = z.object({
	unreadChatMesageCount: nonNegativeNumber,
});
const UnreadChatCountResponseApiSchema = UnreadChatCountResponseSchema;
const UnreadChatCountResponseDtoSchema = UnreadChatCountResponseSchema;

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
type ChatSendAckResponse = z.infer<typeof ChatSendAckResponseSchema>;
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
	ChatSendAckResponse,
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
	ChatSendAckResponseSchema,
	UnreadChatCountResponseApiSchema,
	UnreadChatCountResponseDtoSchema,
};
