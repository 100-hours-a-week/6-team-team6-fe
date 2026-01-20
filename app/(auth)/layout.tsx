import React from "react";

import LogoHeader from "@/shared/components/layout/headers/LogoHeader";

function AuthLayout({ children }: { children: React.ReactNode }) {
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
