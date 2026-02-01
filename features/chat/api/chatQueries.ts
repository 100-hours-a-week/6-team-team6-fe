type ChatRoomListType = "all" | "item";

export const chatQueryKeys = {
	list: (params?: { type?: ChatRoomListType; postId?: number | null }) =>
		["chatrooms", params?.type ?? "all", params?.postId ?? null] as const,
	chatroomPostId: (chatroomId: number | null) => ["chatrooms", "postId", chatroomId] as const,
	chatroomPostInfo: (chatroomId: number | null, postId: number | null) =>
		["chatrooms", "postInfo", chatroomId, postId] as const,
	chatroomMessages: (chatroomId: number | null, postId: number | null) =>
		["chatrooms", "messages", chatroomId, postId] as const,
	unreadCount: () => ["chatrooms", "unread-count"] as const,
};
