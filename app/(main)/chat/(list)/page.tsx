"use client";

import { Suspense } from "react";

import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { CHAT_LIST_LABELS, DUMMY_CHAT_ROOMS } from "@/features/chat/constants";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

const CHAT_LIST_FALLBACK = (
	<div className="flex items-center gap-2 text-muted-foreground">
		<Spinner />
		<Typography type="body-sm">{CHAT_LIST_LABELS.loading}</Typography>
	</div>
);

function ChatPage() {
	return (
		<Suspense fallback={CHAT_LIST_FALLBACK}>
			<ChatRoomList sourceRooms={DUMMY_CHAT_ROOMS} labels={CHAT_LIST_LABELS} />
		</Suspense>
	);
}

export default ChatPage;
