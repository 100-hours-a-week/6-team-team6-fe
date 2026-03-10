import { z } from "zod";

const CHAT_PENDING_STORAGE_PREFIX = "chat:pending";
const CHAT_PENDING_HELD_STORAGE_PREFIX = "chat:pending:held";

const ChatPendingMessageSchema = z.object({
	clientMessageId: z.string().min(1),
	text: z.string(),
	createdAt: z.string().optional(),
});

const ChatPendingMessagesSchema = z.array(ChatPendingMessageSchema);

type ChatPendingMessage = z.infer<typeof ChatPendingMessageSchema>;

type ChatPendingStorageParams = {
	userId: number;
	chatroomId: string;
};

function canUseLocalStorage() {
	return typeof window !== "undefined";
}

function buildChatPendingStorageKey(params: ChatPendingStorageParams) {
	const { userId, chatroomId } = params;
	return `${CHAT_PENDING_STORAGE_PREFIX}:${userId}:${chatroomId}`;
}

function buildChatPendingHeldStorageKey(params: ChatPendingStorageParams) {
	const { userId, chatroomId } = params;
	return `${CHAT_PENDING_HELD_STORAGE_PREFIX}:${userId}:${chatroomId}`;
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

function readChatPendingHeldMessages(params: ChatPendingStorageParams): ChatPendingMessage[] {
	if (!canUseLocalStorage()) {
		return [];
	}

	try {
		const raw = window.localStorage.getItem(buildChatPendingHeldStorageKey(params));
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

function writeChatPendingHeldMessages(
	params: ChatPendingStorageParams,
	messages: ChatPendingMessage[],
): void {
	if (!canUseLocalStorage()) {
		return;
	}

	try {
		const key = buildChatPendingHeldStorageKey(params);
		if (messages.length === 0) {
			window.localStorage.removeItem(key);
			return;
		}

		window.localStorage.setItem(key, JSON.stringify(messages));
	} catch (error) {
		console.error(error);
	}
}

function clearChatPendingHeldMessages(params: ChatPendingStorageParams): void {
	if (!canUseLocalStorage()) {
		return;
	}

	try {
		window.localStorage.removeItem(buildChatPendingHeldStorageKey(params));
	} catch (error) {
		console.error(error);
	}
}

function clearAllChatPendingMessages(): void {
	if (!canUseLocalStorage()) {
		return;
	}

	try {
		const keysToRemove: string[] = [];
		for (let index = 0; index < window.localStorage.length; index += 1) {
			const key = window.localStorage.key(index);
			if (!key || !key.startsWith(`${CHAT_PENDING_STORAGE_PREFIX}:`)) {
				continue;
			}
			keysToRemove.push(key);
		}

		for (const key of keysToRemove) {
			window.localStorage.removeItem(key);
		}
	} catch (error) {
		console.error(error);
	}
}

export type { ChatPendingMessage, ChatPendingStorageParams };
export {
	buildChatPendingHeldStorageKey,
	buildChatPendingStorageKey,
	CHAT_PENDING_HELD_STORAGE_PREFIX,
	CHAT_PENDING_STORAGE_PREFIX,
	clearAllChatPendingMessages,
	clearChatPendingHeldMessages,
	clearChatPendingMessages,
	readChatPendingHeldMessages,
	readChatPendingMessages,
	writeChatPendingHeldMessages,
	writeChatPendingMessages,
};
