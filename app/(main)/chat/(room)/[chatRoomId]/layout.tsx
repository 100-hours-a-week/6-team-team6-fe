import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { chatQueryKeys } from "@/features/chat/api/chatQueries";
import { getChatroomPostInfoServer } from "@/features/chat/api/getChatroomPostInfoServer";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface ChatRoomLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		chatroomId: string;
	}>;
}

async function ChatRoomLayout(props: ChatRoomLayoutProps) {
	const { children, params } = props;
	const { chatroomId } = await params;
	const queryClient = new QueryClient();

	let title = "";

	try {
		const { postId, postInfo } = await getChatroomPostInfoServer({
			chatroomId,
		});

		queryClient.setQueryData(chatQueryKeys.chatroomPostId(chatroomId), { postId });
		queryClient.setQueryData(chatQueryKeys.chatroomPostInfo(chatroomId, postId), postInfo);

		title = postInfo.isPartnerLeftGroup
			? `${postInfo.partnerNickname}(탈퇴)`
			: postInfo.partnerNickname;
	} catch {
		// TODO fallback logic
	}

	return (
		<div className="relative">
			<TitleBackHeader title={title} />
			<HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
		</div>
	);
}

export default ChatRoomLayout;
