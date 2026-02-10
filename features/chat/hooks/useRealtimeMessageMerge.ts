import { type Dispatch, RefObject, type SetStateAction, useMemo, useRef, useState } from "react";

import type { ChatMessage, ChatMessages } from "@/features/chat/lib/types";

type UseRealtimeMessageMergeParams = {
	chatroomId: number | null;
	messages: ChatMessages;
};

type UseRealtimeMessageMergeResult = {
	mergedMessages: ChatMessages;
	realtimeChatroomIdRef: RefObject<number | null>;
	setRealtimeChatroomId: Dispatch<SetStateAction<number | null>>;
	setRealtimeMessages: Dispatch<SetStateAction<ChatMessages>>;
};

function getMessageKey(message: ChatMessage) {
	return message.messageId ?? `${message.who}:${message.createdAt}:${message.message}`;
}

function mergeMessages(
	historyMessages: ChatMessages,
	realtimeMessages: ChatMessages,
): ChatMessages {
	const merged: ChatMessages = [];
	const seen = new Set<string>();

	for (const message of [...realtimeMessages, ...historyMessages]) {
		const key = getMessageKey(message);
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		merged.push(message);
	}

	return merged.sort((left, right) => {
		const leftTime = Date.parse(left.createdAt);
		const rightTime = Date.parse(right.createdAt);

		if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
			const leftId = left.messageId ?? "";
			const rightId = right.messageId ?? "";
			return rightId.localeCompare(leftId);
		}

		if (rightTime !== leftTime) {
			return rightTime - leftTime;
		}

		const leftId = left.messageId ?? "";
		const rightId = right.messageId ?? "";
		return rightId.localeCompare(leftId);
	});
}

export function useRealtimeMessageMerge(
	params: UseRealtimeMessageMergeParams,
): UseRealtimeMessageMergeResult {
	const { chatroomId, messages } = params;
	const [realtimeChatroomId, setRealtimeChatroomId] = useState<number | null>(null);
	const [realtimeMessages, setRealtimeMessages] = useState<ChatMessages>([]);
	const realtimeChatroomIdRef = useRef<number | null>(null);

	const mergedMessages = useMemo(() => {
		if (chatroomId === null || realtimeChatroomId !== chatroomId) {
			return mergeMessages(messages, []);
		}
		return mergeMessages(messages, realtimeMessages);
	}, [chatroomId, messages, realtimeChatroomId, realtimeMessages]);

	return {
		mergedMessages,
		realtimeChatroomIdRef,
		setRealtimeChatroomId,
		setRealtimeMessages,
	};
}
