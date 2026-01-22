"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Typography } from "@/shared/components/ui/typography";

type ChatMessage = {
	who: "me" | "partner";
	message: string;
	createdAt: string;
};

type ChatMessages = ChatMessage[];

type ChatPostInfoData = {
	partnerId: number;
	partnerNickname: string;
	groupId: number;
	groupName: string;
	postId: number;
	postTitle: string;
	postFirstImageUrl: string;
	rentalFee: number;
	feeUnit: "HOUR" | "DAY";
	rentalStatus: "AVAILABLE" | "RENTED_OUT";
};

const createTimestamp = (minutesAgo: number) =>
	new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const DUMMY_CHAT_POST_INFO: ChatPostInfoData = {
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

const INITIAL_MESSAGES: ChatMessages = [
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

const OLDER_MESSAGES: ChatMessages = [
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

function ChatRoom() {
	const [messages, setMessages] = useState<ChatMessages>(INITIAL_MESSAGES);
	const [hasMoreMessage, setHasMoreMessage] = useState(true);
	const [isLoadingPreviousMessage, setIsLoadingPreviousMessage] = useState(false);

	const handleLoadMore = useCallback(async () => {
		if (!hasMoreMessage || isLoadingPreviousMessage) {
			return;
		}
		setIsLoadingPreviousMessage(true);

		await new Promise((resolve) => setTimeout(resolve, 300));
		setMessages((prev) => [...prev, ...OLDER_MESSAGES]);
		setHasMoreMessage(false);
		setIsLoadingPreviousMessage(false);
	}, [hasMoreMessage, isLoadingPreviousMessage]);

	const handleSubmit = useCallback((text: string) => {
		const nextMessage: ChatMessage = {
			who: "me",
			message: text,
			createdAt: new Date().toISOString(),
		};
		setMessages((prev) => [nextMessage, ...prev]);
	}, []);

	return (
		<div className="flex flex-col h-[calc(100dvh-var(--h-header))]">
			<ChatPostInfo postInfo={DUMMY_CHAT_POST_INFO} />
			<Separator />
			<ChatMessageList
				messageList={messages}
				hasMoreMessage={hasMoreMessage}
				onLoadMore={handleLoadMore}
				isLoadingPreviousMessage={isLoadingPreviousMessage}
			/>
			<ChatInput onSubmit={handleSubmit} />
		</div>
	);
}

type ChatPostInfoProps = {
	postInfo: ChatPostInfoData;
};

function ChatPostInfo({ postInfo }: ChatPostInfoProps) {
	const { groupId, postId, postFirstImageUrl, postTitle, rentalFee, feeUnit, rentalStatus } =
		postInfo;
	const feeLabel =
		rentalFee === 0
			? "무료 대여"
			: `${rentalFee.toLocaleString()} / ${feeUnit === "HOUR" ? "시간" : "일"}`;
	const statusLabel = rentalStatus === "RENTED_OUT" ? "대여 중" : "대여 가능";

	return (
		<Link href={`/groups/${groupId}/posts/${postId}`} className="block">
			<Card
				size="sm"
				className="transition-colors hover:bg-muted/40 border-0 border-t-none border-l-none border-r-none border-b-none"
			>
				<CardContent className="flex items-center gap-3 border-0">
					<Image
						src={postFirstImageUrl}
						alt={postTitle}
						width={56}
						height={56}
						className="rounded-lg object-cover"
					/>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<Typography type="subtitle" className="truncate">
							{postTitle}
						</Typography>
						<Typography type="body-sm" className="text-muted-foreground">
							{feeLabel}
						</Typography>
					</div>
					<Badge variant={rentalStatus === "RENTED_OUT" ? "secondary" : "outline"}>
						{statusLabel}
					</Badge>
				</CardContent>
			</Card>
		</Link>
	);
}

type ChatMessageListProps = {
	messageList: ChatMessages;
	hasMoreMessage: boolean;
	onLoadMore: () => Promise<void> | void;
	isLoadingPreviousMessage: boolean;
};

function ChatMessageList({
	messageList,
	hasMoreMessage,
	onLoadMore,
	isLoadingPreviousMessage,
}: ChatMessageListProps) {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const skipAutoScrollRef = useRef(false);

	const orderedMessages = useMemo(() => [...messageList].reverse(), [messageList]);

	const handleScroll = useCallback(() => {
		if (!parentRef.current) {
			return;
		}
		if (!hasMoreMessage || isLoadingPreviousMessage) {
			return;
		}
		if (parentRef.current.scrollTop <= 40) {
			onLoadMore();
		}
	}, [hasMoreMessage, isLoadingPreviousMessage, onLoadMore]);

	useEffect(() => {
		if (isLoadingPreviousMessage) {
			skipAutoScrollRef.current = true;
			return;
		}

		if (skipAutoScrollRef.current) {
			skipAutoScrollRef.current = false;
			return;
		}

		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [isLoadingPreviousMessage, messageList.length]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "auto" });
	}, []);

	if (messageList.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center px-4 py-6">
				<Typography type="body-sm" className="text-muted-foreground">
					대화를 시작해 보세요.
				</Typography>
			</div>
		);
	}

	return (
		<div
			ref={parentRef}
			onScroll={handleScroll}
			className="flex-1 overflow-y-auto px-4 py-4 pb-24 no-scrollbar"
		>
			<div className="flex flex-col gap-3">
				{isLoadingPreviousMessage && (
					<div className="flex justify-center">
						<Spinner className="text-muted-foreground" />
					</div>
				)}
				{!hasMoreMessage && (
					<Typography type="caption" className="text-center text-muted-foreground">
						이전 메시지가 없습니다.
					</Typography>
				)}
				{orderedMessages.map((message, index) => {
					const isMe = message.who === "me";
					const showTime = shouldShowTime(index, orderedMessages);

					return (
						<div
							key={`${message.createdAt}-${index}`}
							className={`flex ${isMe ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`flex items-end gap-2 max-w-[75%] ${
									isMe ? "flex-row" : "flex-row-reverse"
								}`}
							>
								{showTime ? (
									<Typography type="caption" className="text-muted-foreground whitespace-nowrap">
										{formatMessageTime(message.createdAt)}
									</Typography>
								) : null}
								<div className={`rounded-2xl px-3 py-2 ${isMe ? "bg-primary" : "bg-muted"}`}>
									<Typography
										type="body-sm"
										className={`whitespace-pre-wrap break-all ${isMe ? "text-white" : ""}`}
									>
										{message.message}
									</Typography>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div ref={bottomRef} />
		</div>
	);
}

function formatMessageTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("ko-KR", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

function getMinuteKey(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}

function shouldShowTime(index: number, messages: ChatMessages) {
	if (index >= messages.length - 1) {
		return true;
	}

	return getMinuteKey(messages[index].createdAt) !== getMinuteKey(messages[index + 1].createdAt);
}

function ChatInput({ onSubmit }: { onSubmit: (text: string) => void }) {
	const [value, setValue] = useState("");

	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const text = value.trim();
			if (!text) {
				return;
			}

			onSubmit(text);
			setValue("");
		},
		[onSubmit, value],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key !== "Enter" || event.shiftKey) {
				return;
			}

			event.preventDefault();
			const text = value.trim();
			if (!text) {
				return;
			}

			onSubmit(text);
			setValue("");
		},
		[onSubmit, value],
	);

	return (
		<NavigationLayout>
			<form onSubmit={handleSubmit} className="flex w-full gap-2 px-2">
				<Textarea
					value={value}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="메시지를 입력하세요"
					rows={1}
					className="h-10 min-h-10 resize-none overflow-y-auto no-scrollbar"
				/>
				<Button type="submit" size="xl" className="w-20 h-10">
					전송
				</Button>
			</form>
		</NavigationLayout>
	);
}

export default ChatRoom;
