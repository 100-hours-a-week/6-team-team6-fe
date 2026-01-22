import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface ChatRoomLayoutProps {
	children: React.ReactNode;
}

function ChatRoomLayout(props: ChatRoomLayoutProps) {
	const { children } = props;

	return (
		<div className="relative">
			<TitleBackHeader title="닉네임" />
			{children}
		</div>
	);
}

export default ChatRoomLayout;
