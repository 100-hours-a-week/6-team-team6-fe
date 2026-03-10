import type { ChatroomPostInfoDto } from "@/features/chat/schemas";

export type ChatSummary = {
	chatroomId: number;
	postFirstImageUrl: string;
	lastMessageAt: string;
	lastMessage: string;
	unreadCount: number;
};

export type ChatPartner = {
	chatPartnerId: number;
	chatPartnerAvatarUrl: string;
	chatPartnerNickname: string;
};

export type RoomSummary = ChatSummary & ChatPartner;

export type ChatRoomSource = RoomSummary & {
	postId: number;
	groupId?: number;
	groupName?: string;
};

export type ChatMessage = {
	messageId?: string;
	clientMessageId?: string | null;
	deliveryStatus?: "in_flight" | "held" | "failed";
	who: "me" | "partner";
	message: string;
	createdAt: string;
};

export type ChatMessages = ChatMessage[];

export type ChatPostInfoData = ChatroomPostInfoDto;

export type ChatRoomListLabels = {
	loading: string;
	error: string;
	empty: string;
	fetchingNextPage: string;
	endOfList: string;
};

export const CHAT_ROOM_LIST_VIEW_STATE = {
	loading: "loading",
	error: "error",
	empty: "empty",
	content: "content",
} as const;

export type ChatRoomListViewState =
	(typeof CHAT_ROOM_LIST_VIEW_STATE)[keyof typeof CHAT_ROOM_LIST_VIEW_STATE];
