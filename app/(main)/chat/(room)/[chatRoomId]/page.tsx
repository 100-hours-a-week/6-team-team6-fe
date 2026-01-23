"use client";

import Image from "next/image";
import Link from "next/link";

import { useChatInput } from "@/features/chat/hooks/useChatInput";
import { useChatMessageList } from "@/features/chat/hooks/useChatMessageList";
import { useChatRoom } from "@/features/chat/hooks/useChatRoom";
import type { ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Typography } from "@/shared/components/ui/typography";

interface ChatPostInfoProps {
	postInfo: ChatPostInfoData;
}

function ChatPostInfo(props: ChatPostInfoProps) {
	const { postInfo } = props;
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
	const { messageEntries, parentRef, bottomRef, handleScroll } = useChatMessageList({
		messageList,
		hasMoreMessage,
		isLoadingPreviousMessage,
		onLoadMore,
	});

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
				{messageEntries.map(({ message, isMe, timeLabel }, index) => {
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
								{timeLabel ? (
									<Typography type="caption" className="text-muted-foreground whitespace-nowrap">
										{timeLabel}
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

interface ChatInputProps {
	onSubmit: (text: string) => void;
}

function ChatInput(props: ChatInputProps) {
	const { onSubmit } = props;
	const { value, handleChange, handleKeyDown, handleSubmit } = useChatInput({ onSubmit });

	return (
		<NavigationLayout>
			<form onSubmit={handleSubmit} className="flex w-full gap-2 px-2">
				<Textarea
					value={value}
					onChange={handleChange}
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

function ChatRoom() {
	const {
		postInfo,
		messages,
		hasMoreMessage,
		isLoadingPreviousMessage,
		loadMoreMessages,
		submitMessage,
	} = useChatRoom();

	return (
		<div className="flex flex-col h-[calc(100dvh-var(--h-header))]">
			<ChatPostInfo postInfo={postInfo} />
			<Separator />
			<ChatMessageList
				messageList={messages}
				hasMoreMessage={hasMoreMessage}
				onLoadMore={loadMoreMessages}
				isLoadingPreviousMessage={isLoadingPreviousMessage}
			/>
			<ChatInput onSubmit={submitMessage} />
		</div>
	);
}

export default ChatRoom;
