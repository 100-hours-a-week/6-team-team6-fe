"use client";

import { useChatInboxStomp } from "@/features/chat/hooks/useChatInboxStomp";

export function ChatInboxRealtimeBridge() {
	useChatInboxStomp();

	return null;
}
