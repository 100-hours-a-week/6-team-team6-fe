import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import { getChatroomPostInfoServer } from "@/features/chat/api/getChatroomPostInfoServer";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface ChatRoomLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		chatRoomId: string;
	}>;
}

async function ChatRoomLayout(props: ChatRoomLayoutProps) {
	const { children, params } = props;
	const { chatRoomId } = await params;
	const parsedChatroomId = Number(chatRoomId);
	const queryClient = new QueryClient();

	let title = "";

	if (!Number.isNaN(parsedChatroomId)) {
		try {
			const { postId, postInfo } = await getChatroomPostInfoServer({
				chatroomId: parsedChatroomId,
			});

			queryClient.setQueryData(chatQueryKeys.chatroomPostId(parsedChatroomId), { postId });
			queryClient.setQueryData(chatQueryKeys.chatroomPostInfo(parsedChatroomId, postId), postInfo);

			title = postInfo.isPartnerLeftGroup
				? `${postInfo.partnerNickname}(탈퇴)`
				: postInfo.partnerNickname;
		} catch {
			// TODO fallback logic
		}
	}

	return (
		<div className="relative">
			<TitleBackHeader title={title} />
			<HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
		</div>
	);
}

export default ChatRoomLayout;
