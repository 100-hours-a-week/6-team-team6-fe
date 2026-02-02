import { useCallback, useEffect, useMemo, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { useChatListSSE } from "@/features/chat/hooks/useChatListSSE";
import { useChatRooms } from "@/features/chat/hooks/useChatRooms";
export function useChatList() {
	const searchParams = useSearchParams();
	const typeParam = searchParams.get("type");
	const postId = useMemo(() => {
		const postIdParam = searchParams.get("postId");
		if (!postIdParam) {
			return null;
		}
		const parsed = Number(postIdParam);
		return Number.isNaN(parsed) ? null : parsed;
	}, [searchParams]);

	const isItemList = typeParam === "item" && postId !== null;
	const listType = isItemList ? "item" : "all";

	const { rooms, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
		useChatRooms({ postId: isItemList ? postId : null, listType });

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
