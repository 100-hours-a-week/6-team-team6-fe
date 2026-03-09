"use client";

import Image from "next/image";
import Link from "next/link";

import { useChatInput } from "@/features/chat/hooks/useChatInput";
import { useChatMessageList } from "@/features/chat/hooks/useChatMessageList";
import { useChatRoom } from "@/features/chat/hooks/useChatRoom";
import { useChatRoomStomp } from "@/features/chat/hooks/useChatRoomStomp";
import type { ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Typography } from "@/shared/components/ui/typography";

import { formatRentalFeeLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

interface ChatPostInfoProps {
	postInfo: ChatPostInfoData;
}

function ChatPostInfo(props: ChatPostInfoProps) {
	const { postInfo } = props;
	const {
		groupId,
		postId,
		postFirstImageUrl,
		postTitle,
		rentalFee,
		feeUnit,
		rentalStatus,
		isPostDeleted,
	} = postInfo;
	const feeLabel = formatRentalFeeLabel(rentalFee, feeUnit);
	const statusLabel = rentalStatus === "RENTED_OUT" ? "대여 중" : "대여 가능";

	return (
		<Link href={`/groups/${groupId}/posts/${postId}`} className="border-none">
			<Card
				size="sm"
				className={cn(
					"relative border-0 rounded-none",
					isPostDeleted ? "overflow-hidden" : "transition-colors hover:bg-muted/40",
				)}
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
							{isPostDeleted ? <span className="font-bold mr-1">(삭제됨)</span> : null}
							<span>{postTitle}</span>
						</Typography>
						<Typography type="body-sm" className="text-muted-foreground">
							{feeLabel}
						</Typography>
					</div>
					{isPostDeleted ? null : (
						<Badge variant={rentalStatus === "RENTED_OUT" ? "secondary" : "outline"}>
							{statusLabel}
						</Badge>
					)}
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
	onRetryDeliveryMessage: (clientMessageId: string) => void;
};

function ChatMessageList({
	messageList,
	hasMoreMessage,
	onLoadMore,
	isLoadingPreviousMessage,
	onRetryDeliveryMessage,
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
				{messageEntries.map(({ message, isMe, timeLabel }, index) => {
					const showDeliverySpinner = message.deliveryStatus === "in_flight";
					const canRetryDelivery =
						(message.deliveryStatus === "failed" || message.deliveryStatus === "held") &&
						typeof message.clientMessageId === "string";

					return (
						<div
							key={`${message.clientMessageId ?? message.messageId ?? message.createdAt}-${index}`}
							className={`flex ${isMe ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`flex items-end gap-2 max-w-[75%] ${
									isMe ? "flex-row" : "flex-row-reverse"
								}`}
							>
								{showDeliverySpinner ? <Spinner className="size-3 text-muted-foreground" /> : null}
								{canRetryDelivery ? (
									<Button
										type="button"
										variant="link"
										size="xs"
										className="h-auto p-0 text-muted-foreground"
										onClick={() => onRetryDeliveryMessage(message.clientMessageId as string)}
									>
										다시 전송
									</Button>
								) : null}
								{!showDeliverySpinner && !canRetryDelivery && timeLabel ? (
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
	isDisabled?: boolean;
	disabledMessage?: string;
}

function ChatInput(props: ChatInputProps) {
	const { onSubmit, isDisabled = false, disabledMessage = "상대방과 대화가 불가능합니다." } = props;
	const {
		value,
		handleChange,
		handleKeyDown,
		handleSubmit,
		handleCompositionStart,
		handleCompositionEnd,
	} = useChatInput({ onSubmit, disabled: isDisabled });

	return (
		<NavigationLayout>
			<form onSubmit={handleSubmit} className="flex w-full gap-2 px-2">
				<Textarea
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onCompositionStart={handleCompositionStart}
					onCompositionEnd={handleCompositionEnd}
					placeholder={isDisabled ? disabledMessage : "메시지를 입력하세요"}
					rows={1}
					disabled={isDisabled}
					className="h-10 min-h-10 resize-none overflow-y-auto no-scrollbar"
				/>
				<Button
					type="submit"
					size="xl"
					className="w-20 h-10"
					disabled={isDisabled || value.trim() === ""}
				>
					전송
				</Button>
			</form>
		</NavigationLayout>
	);
}

export function ChatRoomPage() {
	const {
		postInfo,
		isPostInfoLoading,
		isPostInfoError,
		isMessagesLoading,
		isMessagesError,
		messages,
		hasMoreMessage,
		isLoadingPreviousMessage,
		loadMoreMessages,
	} = useChatRoom();
	const { mergedMessages, submitMessageByStomp, retryHeldMessageByClientMessageId } =
		useChatRoomStomp({ messages });
	const isChatUnavailable = postInfo?.isPostDeleted ?? false;

	return (
		<div className="flex flex-col h-[calc(100dvh-var(--h-header))]">
			{isPostInfoLoading ? (
				<div className="flex items-center justify-center gap-2 px-4 py-6 text-muted-foreground">
					<Spinner />
				</div>
			) : isPostInfoError || !postInfo ? (
				<div className="flex items-center justify-center px-4 py-6 text-muted-foreground">
					<Typography type="body-sm">채팅 정보를 불러오지 못했습니다.</Typography>
				</div>
			) : (
				<ChatPostInfo postInfo={postInfo} />
			)}
			<Separator />
			{isMessagesLoading && mergedMessages.length === 0 ? (
				<div className="flex flex-1 items-center justify-center gap-2 px-4 py-6 text-muted-foreground">
					<Spinner />
					<Typography type="body-sm">메시지를 불러오는 중</Typography>
				</div>
			) : isMessagesError ? (
				<div className="flex flex-1 items-center justify-center px-4 py-6 text-muted-foreground">
					<Typography type="body-sm">메시지를 불러오지 못했습니다.</Typography>
				</div>
			) : (
				<ChatMessageList
					messageList={mergedMessages}
					hasMoreMessage={hasMoreMessage}
					onLoadMore={loadMoreMessages}
					isLoadingPreviousMessage={isLoadingPreviousMessage}
					onRetryDeliveryMessage={retryHeldMessageByClientMessageId}
				/>
			)}
			<ChatInput onSubmit={submitMessageByStomp} isDisabled={isChatUnavailable} />
		</div>
	);
}
