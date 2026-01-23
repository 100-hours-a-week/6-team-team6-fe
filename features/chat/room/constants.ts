import { createTimestamp } from "@/features/chat/room/utils";
import type { ChatMessages, ChatPostInfoData } from "@/features/chat/types";

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
