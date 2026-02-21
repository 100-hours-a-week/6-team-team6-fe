import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface MyPageLayoutProps {
	children: React.ReactNode;
}

function MyPageLayout(props: MyPageLayoutProps) {
	const { children } = props;

	return (
		<>
			<TitleBackHeader title="마이페이지" />
			<div className="flex flex-1">
				<section className="flex flex-1 min-h-0 flex-col">{children}</section>
			</div>
			<DefaultNavigation />
		</>
	);
}

export default MyPageLayout;
