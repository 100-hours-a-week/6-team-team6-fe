import type { ChatMessages, ChatPostInfoData, ChatRoomSource } from "@/features/chat/lib/types";
import { createTimestamp } from "@/features/chat/lib/utils";

export const DUMMY_CHAT_ROOMS: ChatRoomSource[] = [
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

export const DUMMY_CHAT_POST_INFO: ChatPostInfoData = {
	partnerId: 3,
	partnerNickname: "테스트닉네임",
	groupId: 7,
	groupName: "테스트그룹",
	postId: 14,
	postTitle: "산악자전거 대여~",
	postFirstImageUrl: "/dummy-post-image.png",
	rentalFee: 5000,
	feeUnit: "HOUR",
	rentalStatus: "RENTED_OUT",
};

export const INITIAL_MESSAGES: ChatMessages = [
	{
		who: "me",
		message: "네, 지금 바로 갈게요.",
		createdAt: createTimestamp(1),
	},
	{
		who: "partner",
		message: "네! 기다리고 있을게요.",
		createdAt: createTimestamp(1),
	},
	{
		who: "partner",
		message: "오늘 오후 2시에 만나도 될까요?",
		createdAt: createTimestamp(6),
	},
	{
		who: "me",
		message: "가능해요. 장소는 정문으로 할까요?",
		createdAt: createTimestamp(6),
	},
	{
		who: "partner",
		message: "안녕하세요. 대여 가능 시간 알려주세요.",
		createdAt: createTimestamp(80),
	},
];

export const OLDER_MESSAGES: ChatMessages = [
	{
		who: "partner",
		message: "혹시 대여 기간은 하루로 가능한가요?",
		createdAt: createTimestamp(140),
	},
	{
		who: "me",
		message: "네 가능합니다. 원하는 시간 알려주세요.",
		createdAt: createTimestamp(160),
	},
];
