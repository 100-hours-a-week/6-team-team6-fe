import { useCallback, useEffect, useMemo, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { useChatListSSE } from "@/features/chat/hooks/useChatListSSE";
import { useChatRooms } from "@/features/chat/hooks/useChatRooms";
import type { ChatRoomSource } from "@/features/chat/lib/types";

type UseChatListParams = {
	sourceRooms: ChatRoomSource[];
	pageSize?: number;
};

export function useChatList({ sourceRooms, pageSize }: UseChatListParams) {
	const searchParams = useSearchParams();
	const postId = useMemo(() => {
		const postIdParam = searchParams.get("postId");
		if (!postIdParam) {
			return null;
		}
		const parsed = Number(postIdParam);
		return Number.isNaN(parsed) ? null : parsed;
	}, [searchParams]);

	const { rooms, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
		useChatRooms({ postId, sourceRooms, pageSize });

	const fetchNextPageRef = useRef(fetchNextPage);
	const hasNextPageRef = useRef(hasNextPage);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useChatListSSE();

	useEffect(() => {
		fetchNextPageRef.current = fetchNextPage;
	}, [fetchNextPage]);

	useEffect(() => {
		hasNextPageRef.current = hasNextPage;
	}, [hasNextPage]);

	const setLoaderRef = useCallback((node: HTMLDivElement | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		if (!node) {
			return;
		}

		observerRef.current = new IntersectionObserver((entries) => {
			const first = entries[0];
			if (!first?.isIntersecting) {
				return;
			}
			if (!hasNextPageRef.current) {
				return;
			}
			fetchNextPageRef.current();
		});

		observerRef.current.observe(node);
	}, []);

	return {
		rooms,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		setLoaderRef,
	};
}
