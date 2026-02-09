import React from "react";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/auth";
import { routeConst } from "@/shared/lib/constants";

import { AuthSessionProvider } from "@/shared/providers";

interface AuthLayoutProps {
	children: React.ReactNode;
}

async function AuthLayout(props: AuthLayoutProps) {
	const { children } = props;
	const session = await getServerSession(authOptions);

	if (session && !session.error) {
		redirect(routeConst.DEFAULT_AUTH_REDIRECT_PATH);
	}

	return <AuthSessionProvider session={session}>{children}</AuthSessionProvider>;
}

export default AuthLayout;
