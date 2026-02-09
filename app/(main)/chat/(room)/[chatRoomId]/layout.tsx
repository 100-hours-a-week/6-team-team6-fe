import {
	ChatroomPostIdResponseApiSchema,
	ChatroomPostInfoApiSchema,
} from "@/features/chat/schemas";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

interface ChatRoomLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		chatRoomId: string;
	}>;
}

const fetchPartnerNickname = async (chatroomId: number) => {
	const postIdResponse = await requestJson(
		apiServer.get(`chatrooms/${chatroomId}/post`, { throwHttpErrors: false }),
		ChatroomPostIdResponseApiSchema,
	);
	const postInfo = await requestJson(
		apiServer.get(`posts/${postIdResponse.postId}/chatrooms/${chatroomId}/post`, {
			throwHttpErrors: false,
		}),
		ChatroomPostInfoApiSchema,
	);
	return postInfo.partnerNickname;
};

async function ChatRoomLayout(props: ChatRoomLayoutProps) {
	const { children, params } = props;
	const { chatRoomId } = await params;
	const parsedChatroomId = Number(chatRoomId);
	let title = "";

	if (!Number.isNaN(parsedChatroomId)) {
		try {
			title = await fetchPartnerNickname(parsedChatroomId);
		} catch {
			// TODO fallback logic
		}
	}

	return (
		<div className="relative">
			<TitleBackHeader title={title} />
			{children}
		</div>
	);
}

export default ChatRoomLayout;
