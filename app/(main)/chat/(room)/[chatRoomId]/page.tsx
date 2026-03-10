import { ChatRoomPage } from "@/features/chat/screens/ChatRoomPage";

interface ChatRoomRoutePageProps {
	params: Promise<{
		chatroomId: string;
	}>;
	searchParams: Promise<{
		postId?: string | string[];
	}>;
}

function parseOptionalPostId(rawPostId: string | string[] | undefined): number | null {
	if (typeof rawPostId !== "string") {
		return null;
	}

	const parsed = Number(rawPostId);
	return Number.isNaN(parsed) ? null : parsed;
}

export default async function Page(props: ChatRoomRoutePageProps) {
	const { chatroomId } = await props.params;
	const { postId } = await props.searchParams;

	return <ChatRoomPage chatroomId={chatroomId} initialPostId={parseOptionalPostId(postId)} />;
}
