export type ChatSummary = {
	chatRoomId: number;
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
};

export const CHAT_ROOM_LIST_VIEW_STATE = {
	loading: "loading",
	error: "error",
	empty: "empty",
	content: "content",
} as const;

export type ChatRoomListViewState =
	(typeof CHAT_ROOM_LIST_VIEW_STATE)[keyof typeof CHAT_ROOM_LIST_VIEW_STATE];
