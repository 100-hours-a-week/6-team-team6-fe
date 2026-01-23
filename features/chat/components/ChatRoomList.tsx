"use client";

import type { ReactNode } from "react";

import { ChatRoomItem } from "@/features/chat/components/ChatRoomItem";
import { useChatList } from "@/features/chat/hooks/useChatList";
import type { ChatRoomSource, RoomSummary } from "@/features/chat/types";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

type ChatRoomListProps = {
	sourceRooms: ChatRoomSource[];
	labels: ChatRoomListLabels;
};

type ChatRoomListViewState = "loading" | "error" | "empty" | "content";

type ChatRoomListLabels = {
	loading: string;
	error: string;
	empty: string;
	fetchingNextPage: string;
	endOfList: string;
};

type ChatRoomListViewProps = {
	state: ChatRoomListViewState;
	rooms: RoomSummary[];
	setLoaderRef: (node: HTMLDivElement | null) => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	labels: ChatRoomListLabels;
};

export function ChatRoomList(props: ChatRoomListProps) {
	const { sourceRooms, labels } = props;

	const { rooms, setLoaderRef, hasNextPage, isFetchingNextPage, isLoading, isError } = useChatList({
		sourceRooms,
	});

	const state: ChatRoomListViewState = isLoading
		? "loading"
		: isError
			? "error"
			: rooms.length === 0
				? "empty"
				: "content";

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

function ChatRoomListView({
	state,
	rooms,
	setLoaderRef,
	hasNextPage,
	isFetchingNextPage,
	labels,
}: ChatRoomListViewProps) {
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

function ChatRoomListLoading({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-2 text-muted-foreground">
			<Spinner />
			<Typography type="body-sm">{label}</Typography>
		</div>
	);
}

function ChatRoomListError({ label }: { label: string }) {
	return (
		<Typography type="body-sm" className="text-destructive">
			{label}
		</Typography>
	);
}

function ChatRoomListEmpty({ label }: { label: string }) {
	return (
		<Typography type="body-sm" className="text-muted-foreground">
			{label}
		</Typography>
	);
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
