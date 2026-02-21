import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
import LogoBackHeader from "@/shared/components/layout/headers/LogoBackHeader";
import { Typography } from "@/shared/components/ui/typography";

interface ChatPageLayoutProps {
	children: React.ReactNode;
}

function ChatPageLayout(props: ChatPageLayoutProps) {
	const { children } = props;

	return (
		<>
			<LogoBackHeader />
			<div className="flex flex-1">
				<section className="flex flex-1  flex-col h-full px-5 py-10 w-full max-w-(--app-max-width)">
					<Typography type={"title"} className="mb-8">
						채팅
					</Typography>
					{children}
				</section>
			</div>
			<DefaultNavigation />
		</>
	);
}

export default ChatPageLayout;
