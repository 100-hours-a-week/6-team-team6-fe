import type { ChatRoomListLabels } from "@/features/chat/lib/types";

export const CHAT_LIST_LABELS: ChatRoomListLabels = {
	loading: "채팅방 목록 로딩중...",
	error: "채팅방 목록을 불러오는 중 오류가 발생했어요.",
	empty: "아직 시작된 채팅이 없어요.",
	fetchingNextPage: "더 가져오는 중...",
	endOfList: "마지막입니다.",
};

export const STOMP_DESTINATION = {
	subscribe: (chatroomId: number) => `/topic/chatrooms/${chatroomId}`,
	chatInbox: "/user/queue/chat-inbox",
	join: "/app/chat/join",
	send: "/app/chat/send",
	read: "/app/chat/read",
} as const;
