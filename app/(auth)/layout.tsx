import React from "react";

import LogoHeader from "@/shared/components/layout/headers/LogoHeader";

interface AuthLayoutProps {
	children: React.ReactNode;
}

function AuthLayout(props: AuthLayoutProps) {
	const { children } = props;

	return (
		<>
			<LogoHeader />
			<div className="flex flex-1">
				<section className="flex flex-1 flex-col h-full gap-6 px-5 py-6 my-auto">
					{children}
				</section>
			</div>
		</>
	);
}

export default AuthLayout;
