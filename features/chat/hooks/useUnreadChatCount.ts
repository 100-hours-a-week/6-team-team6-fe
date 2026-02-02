"use client";

import { useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import type { GetUnreadChatCountError } from "@/features/chat/api/getUnreadChatCount";
import { getUnreadChatCount } from "@/features/chat/api/getUnreadChatCount";
import type { UnreadChatCountResponseDto } from "@/features/chat/schemas";

function useUnreadChatCount(enabled = true) {
	return useQuery<UnreadChatCountResponseDto, GetUnreadChatCountError>({
		queryKey: chatQueryKeys.unreadCount(),
		queryFn: () => getUnreadChatCount(),
		enabled,
	});
}

export default useUnreadChatCount;
