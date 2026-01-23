import { useCallback, useEffect, useRef, useState } from "react";

import { DUMMY_CHAT_POST_INFO, INITIAL_MESSAGES, OLDER_MESSAGES } from "@/features/chat/lib/dummy";
import type { ChatMessage, ChatMessages, ChatPostInfoData } from "@/features/chat/lib/types";

const LOAD_MORE_DELAY_MS = 300;

export type UseChatRoomResult = {
	postInfo: ChatPostInfoData;
	messages: ChatMessages;
	hasMoreMessage: boolean;
	isLoadingPreviousMessage: boolean;
	loadMoreMessages: () => void;
	submitMessage: (text: string) => void;
};

export function useChatRoom(): UseChatRoomResult {
	const [messages, setMessages] = useState<ChatMessages>(INITIAL_MESSAGES);
	const [hasMoreMessage, setHasMoreMessage] = useState(true);
	const [isLoadingPreviousMessage, setIsLoadingPreviousMessage] = useState(false);
	const loadMoreTimerRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (loadMoreTimerRef.current !== null) {
				window.clearTimeout(loadMoreTimerRef.current);
			}
		};
	}, []);

	const loadMoreMessages = useCallback(() => {
		if (!hasMoreMessage || isLoadingPreviousMessage) {
			return;
		}
		setIsLoadingPreviousMessage(true);

		loadMoreTimerRef.current = window.setTimeout(() => {
			setMessages((prev) => [...prev, ...OLDER_MESSAGES]);
			setHasMoreMessage(false);
			setIsLoadingPreviousMessage(false);
			loadMoreTimerRef.current = null;
		}, LOAD_MORE_DELAY_MS);
	}, [hasMoreMessage, isLoadingPreviousMessage]);

	const submitMessage = useCallback((text: string) => {
		const nextMessage: ChatMessage = {
			who: "me",
			message: text,
			createdAt: new Date().toISOString(),
		};
		setMessages((prev) => [nextMessage, ...prev]);
	}, []);

	return {
		postInfo: DUMMY_CHAT_POST_INFO,
		messages,
		hasMoreMessage,
		isLoadingPreviousMessage,
		loadMoreMessages,
		submitMessage,
	};
}
