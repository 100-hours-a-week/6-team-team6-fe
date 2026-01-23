"use client";

import { Suspense } from "react";

import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import type { ChatRoomSource } from "@/features/chat/types";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

const CHAT_LIST_LABELS = {
	loading: "채팅방 목록 로딩중...",
	error: "채팅방 목록을 불러오는 중 오류가 발생했어요.",
	empty: "아직 시작된 채팅이 없어요.",
	fetchingNextPage: "더 가져오는 중...",
	endOfList: "마지막입니다.",
};

const CHAT_LIST_FALLBACK = (
	<div className="flex items-center gap-2 text-muted-foreground">
		<Spinner />
		<Typography type="body-sm">{CHAT_LIST_LABELS.loading}</Typography>
	</div>
);

const DUMMY_CHAT_ROOMS: ChatRoomSource[] = [
	{
		chatRoomId: 101,
		postId: 14,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "오전 10:24",
		lastMessage: "내일 오후에 가능해요.",
		unreadCount: 2,
		chatPartnerId: 1,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "민지",
	},
	{
		chatRoomId: 102,
		postId: 14,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "어제",
		lastMessage: "대여 기간은 3일 정도 생각하고 있어요.",
		unreadCount: 0,
		chatPartnerId: 2,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "서준",
	},
	{
		chatRoomId: 103,
		postId: 22,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "3일 전",
		lastMessage: "픽업 장소는 학교 정문으로 괜찮을까요?픽업 장소는 학교 정문으로 괜찮을까요?",
		unreadCount: 1,
		chatPartnerId: 3,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "유나",
	},
	{
		chatRoomId: 104,
		postId: 22,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "4일 전",
		lastMessage: "네, 확인했어요. 감사합니다!",
		unreadCount: 0,
		chatPartnerId: 4,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "지훈",
	},
	{
		chatRoomId: 105,
		postId: 31,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "1주 전",
		lastMessage: "지금 바로 방문해도 될까요?",
		unreadCount: 3,
		chatPartnerId: 5,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "하린",
	},
	{
		chatRoomId: 106,
		postId: 31,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "1주 전",
		lastMessage: "시간 맞춰서 갈게요.",
		unreadCount: 0,
		chatPartnerId: 6,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "현우",
	},
	{
		chatRoomId: 107,
		postId: 41,
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "2주 전",
		lastMessage: "혹시 오늘 오후 6시에 가능하세요?",
		unreadCount: 0,
		chatPartnerId: 7,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "지민",
	},
];

function ChatPage() {
	return (
		<Suspense fallback={CHAT_LIST_FALLBACK}>
			<ChatRoomList sourceRooms={DUMMY_CHAT_ROOMS} labels={CHAT_LIST_LABELS} />
		</Suspense>
	);
}

export default ChatPage;
