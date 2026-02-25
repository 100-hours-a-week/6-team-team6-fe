import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
import LogoBackHeader from "@/shared/components/layout/headers/LogoBackHeader";

interface MyPageLayoutProps {
	children: React.ReactNode;
}

function MyPageLayout(props: MyPageLayoutProps) {
	const { children } = props;

	return (
		<>
			<LogoBackHeader />
			<div className="flex flex-1">
				<section className="flex flex-1 min-h-0 flex-col">{children}</section>
			</div>
			<DefaultNavigation />
		</>
	);
}

export default MyPageLayout;
