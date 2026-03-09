import { z } from "zod";

const CHAT_PENDING_STORAGE_PREFIX = "chat:pending";

const ChatPendingMessageSchema = z.object({
	clientMessageId: z.string().min(1),
	text: z.string(),
});

const ChatPendingMessagesSchema = z.array(ChatPendingMessageSchema);

type ChatPendingMessage = z.infer<typeof ChatPendingMessageSchema>;

type ChatPendingStorageParams = {
	userId: number;
	chatroomId: number;
};

function canUseLocalStorage() {
	return typeof window !== "undefined";
}

function buildChatPendingStorageKey(params: ChatPendingStorageParams) {
	const { userId, chatroomId } = params;
	return `${CHAT_PENDING_STORAGE_PREFIX}:${userId}:${chatroomId}`;
}

function readChatPendingMessages(params: ChatPendingStorageParams): ChatPendingMessage[] {
	if (!canUseLocalStorage()) {
		return [];
	}

	try {
		const raw = window.localStorage.getItem(buildChatPendingStorageKey(params));
		if (!raw) {
			return [];
		}

		const parsed = ChatPendingMessagesSchema.safeParse(JSON.parse(raw));
		if (!parsed.success) {
			return [];
		}

		return parsed.data;
	} catch (error) {
		console.error(error);
		return [];
	}
}

function writeChatPendingMessages(
	params: ChatPendingStorageParams,
	messages: ChatPendingMessage[],
): void {
	if (!canUseLocalStorage()) {
		return;
	}

	try {
		const key = buildChatPendingStorageKey(params);
		if (messages.length === 0) {
			window.localStorage.removeItem(key);
			return;
		}

		window.localStorage.setItem(key, JSON.stringify(messages));
	} catch (error) {
		console.error(error);
	}
}

function clearChatPendingMessages(params: ChatPendingStorageParams): void {
	if (!canUseLocalStorage()) {
		return;
	}

	try {
		window.localStorage.removeItem(buildChatPendingStorageKey(params));
	} catch (error) {
		console.error(error);
	}
}

export type { ChatPendingMessage, ChatPendingStorageParams };
export {
	buildChatPendingStorageKey,
	CHAT_PENDING_STORAGE_PREFIX,
	clearChatPendingMessages,
	readChatPendingMessages,
	writeChatPendingMessages,
};
