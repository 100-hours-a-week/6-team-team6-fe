import type { ReactNode } from "react";

type AuthPageLayoutProps = {
	children: ReactNode;
	header?: ReactNode;
};

function AuthPageLayout(props: AuthPageLayoutProps) {
	const { children, header } = props;

	return (
		<>
			{header}
			<div className="flex flex-1">
				<section className="flex flex-1 flex-col h-full gap-6 px-5 py-6 my-auto">
					{children}
				</section>
			</div>
		</>
	);
}

export default AuthPageLayout;
