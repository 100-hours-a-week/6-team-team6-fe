"use client";

import type { ReactNode } from "react";

import { ChatRoomItem } from "@/features/chat/components/ChatRoomItem";
import {
	ChatRoomListEmpty,
	ChatRoomListError,
	ChatRoomListLoading,
} from "@/features/chat/components/ChatRoomListStates";
import { useChatList } from "@/features/chat/hooks/useChatList";
import {
	CHAT_ROOM_LIST_VIEW_STATE,
	type ChatRoomListViewState,
	type ChatRoomSource,
	type RoomSummary,
} from "@/features/chat/types";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

type ChatRoomListLabels = {
	loading: string;
	error: string;
	empty: string;
	fetchingNextPage: string;
	endOfList: string;
};

interface ChatRoomListViewProps {
	state: ChatRoomListViewState;
	rooms: RoomSummary[];
	setLoaderRef: (node: HTMLDivElement | null) => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	labels: ChatRoomListLabels;
}

function ChatRoomListView(props: ChatRoomListViewProps) {
	const { state, rooms, setLoaderRef, hasNextPage, isFetchingNextPage, labels } = props;

	const views: Record<ChatRoomListViewState, () => ReactNode> = {
		loading: () => <ChatRoomListLoading label={labels.loading} />,
		error: () => <ChatRoomListError label={labels.error} />,
		empty: () => <ChatRoomListEmpty label={labels.empty} />,
		content: () => (
			<ChatRoomListContent
				rooms={rooms}
				setLoaderRef={setLoaderRef}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				labels={labels}
			/>
		),
	};

	return <>{views[state]()}</>;
}

interface ChatRoomListContentProps {
	rooms: RoomSummary[];
	setLoaderRef: (node: HTMLDivElement | null) => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	labels: ChatRoomListLabels;
}

function ChatRoomListContent(props: ChatRoomListContentProps) {
	const { rooms, setLoaderRef, hasNextPage, isFetchingNextPage, labels } = props;

	return (
		<div className="flex flex-col gap-4">
			<ul className="flex flex-col">
				{rooms.map((room) => (
					<li key={room.chatRoomId}>
						<ChatRoomItem room={room} />
					</li>
				))}
			</ul>
			<div ref={setLoaderRef} className="h-4" />
			{isFetchingNextPage ? (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Spinner />
					<Typography type="body-sm">{labels.fetchingNextPage}</Typography>
				</div>
			) : null}
			{!hasNextPage ? (
				<Typography type="caption" className="text-center text-muted-foreground">
					{labels.endOfList}
				</Typography>
			) : null}
		</div>
	);
}

interface ChatRoomListProps {
	sourceRooms: ChatRoomSource[];
	labels: ChatRoomListLabels;
}

function ChatRoomList(props: ChatRoomListProps) {
	const { sourceRooms, labels } = props;

	const { rooms, setLoaderRef, hasNextPage, isFetchingNextPage, isLoading, isError } = useChatList({
		sourceRooms,
	});

	const state: ChatRoomListViewState = isLoading
		? CHAT_ROOM_LIST_VIEW_STATE.loading
		: isError
			? CHAT_ROOM_LIST_VIEW_STATE.error
			: rooms.length === 0
				? CHAT_ROOM_LIST_VIEW_STATE.empty
				: CHAT_ROOM_LIST_VIEW_STATE.content;

	return (
		<ChatRoomListView
			state={state}
			rooms={rooms}
			setLoaderRef={setLoaderRef}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			labels={labels}
		/>
	);
}

export default ChatRoomList;
