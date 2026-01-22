"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

type ChatSummary = {
	chatRoomId: number;
	postFirstImageUrl: string;
	lastMessageAt: string;
	lastMessage: string;
	unreadCount: number;
};

type ChatPartner = {
	chatPartnerId: number;
	chatPartnerAvatarUrl: string;
	chatPartnerNickname: string;
};

type RoomSummary = ChatSummary & ChatPartner;

const PAGE_SIZE = 5;

const DUMMY_CHAT_ROOMS: RoomSummary[] = [
	{
		chatRoomId: 101,
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
		postFirstImageUrl: "/dummy-post-image.png",
		lastMessageAt: "3일 전",
		lastMessage: "픽업 장소는 학교 정문으로 괜찮을까요?",
		unreadCount: 1,
		chatPartnerId: 3,
		chatPartnerAvatarUrl: "/default-profile.png",
		chatPartnerNickname: "유나",
	},
	{
		chatRoomId: 104,
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
	return <ChatList />;
}

function ChatList() {
	const router = useRouter();
	const { rooms, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
		useChatRooms();

	const loaderRef = useRef<HTMLDivElement | null>(null);

	useChatListSSE();

	useEffect(() => {
		if (!loaderRef.current) {
			return;
		}
		if (!hasNextPage) {
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			const first = entries[0];
			if (first?.isIntersecting) {
				fetchNextPage();
			}
		});

		observer.observe(loaderRef.current);

		return () => observer.disconnect();
	}, [hasNextPage, fetchNextPage]);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<Spinner />
				<Typography type="body-sm">채팅방 목록 로딩중...</Typography>
			</div>
		);
	}

	if (isError) {
		return (
			<Typography type="body-sm" className="text-destructive">
				채팅방 목록을 불러오는 중 오류가 발생했어요.
			</Typography>
		);
	}

	if (rooms.length === 0) {
		return (
			<Typography type="body-sm" className="text-muted-foreground">
				아직 시작된 채팅이 없어요.
			</Typography>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<ul className="flex flex-col ">
				{rooms.map((room) => (
					<li key={room.chatRoomId}>
						<ChatRoomItem room={room} />
					</li>
				))}
			</ul>
			<div ref={loaderRef} className="h-4" />
			{isFetchingNextPage && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Spinner />
					<Typography type="body-sm">더 가져오는 중...</Typography>
				</div>
			)}
			{!hasNextPage && (
				<Typography type="caption" className="text-center text-muted-foreground">
					마지막입니다.
				</Typography>
			)}
		</div>
	);
}

type ChatRoomItemProps = {
	room: RoomSummary;
};

function ChatRoomItem({ room }: ChatRoomItemProps) {
	return (
		<Link href={`/chat/${room.chatRoomId}`} className="w-full text-left">
			<div className="transition-colors hover:bg-muted/40  py-3">
				<div className="flex items-center gap-3">
					<Avatar size="xl">
						<AvatarImage src={room.chatPartnerAvatarUrl} alt="채팅방 프로필 이미지" />
						<AvatarFallback>{room.chatPartnerNickname.slice(0, 1)}</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<div className="flex items-center justify-between gap-2">
							<Typography type="subtitle" className="truncate">
								{room.chatPartnerNickname}
							</Typography>
							<Typography type="caption">{room.lastMessageAt}</Typography>
						</div>
						<div className="flex min-w-0 items-center justify-between gap-2">
							<Typography type="body-sm" className="truncate text-muted-foreground">
								{room.lastMessage}
							</Typography>
							{room.unreadCount > 0 ? (
								<Badge variant="product" className="h-5 min-w-5 justify-center px-1">
									{room.unreadCount}
								</Badge>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

function useChatRooms() {
	const [page, setPage] = useState(1);
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
	const timerRef = useRef<number | null>(null);

	const rooms = useMemo(() => DUMMY_CHAT_ROOMS.slice(0, page * PAGE_SIZE), [page]);
	const hasNextPage = rooms.length < DUMMY_CHAT_ROOMS.length;

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

	const fetchNextPage = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}
		setIsFetchingNextPage(true);
		timerRef.current = window.setTimeout(() => {
			setPage((prev) => prev + 1);
			setIsFetchingNextPage(false);
		}, 200);
	}, [hasNextPage, isFetchingNextPage]);

	return {
		rooms,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: false,
		isError: false,
	};
}

function useChatListSSE() {
	useEffect(() => {
		return () => undefined;
	}, []);
}

export default ChatPage;
