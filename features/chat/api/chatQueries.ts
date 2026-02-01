type ChatRoomListType = "all" | "item";

export const chatQueryKeys = {
	list: (params?: { type?: ChatRoomListType; postId?: number | null }) =>
		["chatrooms", params?.type ?? "all", params?.postId ?? null] as const,
};
