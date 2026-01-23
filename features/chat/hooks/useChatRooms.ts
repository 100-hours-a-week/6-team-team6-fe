import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatRoomSource } from "@/features/chat/lib/types";

const DEFAULT_PAGE_SIZE = 5;

type UseChatRoomsParams = {
	postId: number | null;
	sourceRooms: ChatRoomSource[];
	pageSize?: number;
};

export function useChatRooms({
	postId,
	sourceRooms,
	pageSize = DEFAULT_PAGE_SIZE,
}: UseChatRoomsParams) {
	const [page, setPage] = useState(1);
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
	const timerRef = useRef<number | null>(null);
	const isFetchingRef = useRef(false);

	const filteredRooms = useMemo(() => {
		if (postId === null) {
			return sourceRooms;
		}
		return sourceRooms.filter((room) => room.postId === postId);
	}, [postId, sourceRooms]);

	const rooms = useMemo(
		() => filteredRooms.slice(0, page * pageSize),
		[filteredRooms, page, pageSize],
	);
	const hasNextPage = rooms.length < filteredRooms.length;

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		isFetchingRef.current = false;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsFetchingNextPage(false);
		setPage(1);
	}, [postId]);

	const fetchNextPage = useCallback(() => {
		if (!hasNextPage || isFetchingRef.current) {
			return;
		}
		isFetchingRef.current = true;
		setIsFetchingNextPage(true);
		timerRef.current = window.setTimeout(() => {
			setPage((prev) => prev + 1);
			isFetchingRef.current = false;
			setIsFetchingNextPage(false);
		}, 200);
	}, [hasNextPage]);

	return {
		rooms,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: false,
		isError: false,
	};
}
