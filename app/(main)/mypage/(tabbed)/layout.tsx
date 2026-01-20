import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
import DefaultHeader from "@/shared/components/layout/headers/DefaultHeader";

interface MyPageLayoutProps {
	children: React.ReactNode;
}

function MyPageLayout(props: MyPageLayoutProps) {
	const { children } = props;

	return (
		<>
			<DefaultHeader />
			<div className="flex flex-1">
				<section className="flex flex-1 flex-col h-full px-5 py-10">{children}</section>
			</div>
			<DefaultNavigation />
		</>
	);
}

export default MyPageLayout;
