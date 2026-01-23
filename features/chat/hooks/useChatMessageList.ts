import { useCallback, useEffect, useMemo, useRef } from "react";

import type { ChatMessages } from "@/features/chat/lib/types";
import { formatMessageTime, shouldShowTime } from "@/features/chat/lib/utils";

type ChatMessageEntry = {
	message: ChatMessages[number];
	isMe: boolean;
	timeLabel: string | null;
};

interface UseChatMessageListProps {
	messageList: ChatMessages;
	hasMoreMessage: boolean;
	isLoadingPreviousMessage: boolean;
	onLoadMore: () => void | Promise<void>;
}

export function useChatMessageList(props: UseChatMessageListProps) {
	const { messageList, hasMoreMessage, isLoadingPreviousMessage, onLoadMore } = props;

	const parentRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const skipAutoScrollRef = useRef(false);

	const orderedMessages = useMemo(() => [...messageList].reverse(), [messageList]);
	const messageEntries = useMemo<ChatMessageEntry[]>(() => {
		return orderedMessages.map((message, index) => {
			const showTime = shouldShowTime(index, orderedMessages);
			return {
				message,
				isMe: message.who === "me",
				timeLabel: showTime ? formatMessageTime(message.createdAt) : null,
			};
		});
	}, [orderedMessages]);

	const handleScroll = useCallback(() => {
		if (!parentRef.current) {
			return;
		}
		if (!hasMoreMessage || isLoadingPreviousMessage) {
			return;
		}
		if (parentRef.current.scrollTop <= 40) {
			void onLoadMore();
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

	return {
		messageEntries,
		parentRef,
		bottomRef,
		handleScroll,
	};
}
