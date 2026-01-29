import React from "react";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import LogoHeader from "@/shared/components/layout/headers/LogoHeader";

import { authOptions } from "@/shared/lib/auth";
import { routeConst } from "@/shared/lib/constants";

interface AuthLayoutProps {
	children: React.ReactNode;
}

async function AuthLayout(props: AuthLayoutProps) {
	const { children } = props;
	const session = await getServerSession(authOptions);

	if (session) {
		redirect(routeConst.DEFAULT_AUTH_REDIRECT_PATH);
	}

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
