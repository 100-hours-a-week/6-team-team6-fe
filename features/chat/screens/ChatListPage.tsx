"use client";

import { Suspense } from "react";

import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { CHAT_LIST_LABELS } from "@/features/chat/lib/constants";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

const CHAT_LIST_FALLBACK = (
	<div className="flex items-center gap-2 text-muted-foreground">
		<Spinner />
		<Typography type="body-sm">{CHAT_LIST_LABELS.loading}</Typography>
	</div>
);

export function ChatListPage() {
	return (
		<Suspense fallback={CHAT_LIST_FALLBACK}>
			<ChatRoomList labels={CHAT_LIST_LABELS} />
		</Suspense>
	);
}
