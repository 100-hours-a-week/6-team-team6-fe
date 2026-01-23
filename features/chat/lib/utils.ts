import { CHAT_ROOM_LIST_VIEW_STATE, ChatRoomSource } from "@/features/chat/types";

interface GetChatRoomListViewStateProps {
	isLoading: boolean;
	isError: boolean;
	rooms: ChatRoomSource[];
}

export const getChatRoomListViewState = (props: GetChatRoomListViewStateProps) => {
	const { isLoading, isError, rooms } = props;

	if (isLoading) {
		return CHAT_ROOM_LIST_VIEW_STATE.loading;
	}

	if (isError) {
		return CHAT_ROOM_LIST_VIEW_STATE.error;
	}

	if (rooms.length === 0) {
		return CHAT_ROOM_LIST_VIEW_STATE.empty;
	}

	return CHAT_ROOM_LIST_VIEW_STATE.content;
};
