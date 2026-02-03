import React from "react";

import AuthPageLayout from "@/features/auth/components/AuthPageLayout";

import LogoHeader from "@/shared/components/layout/headers/LogoHeader";

interface AuthLayoutProps {
	children: React.ReactNode;
}

function AuthLayout(props: AuthLayoutProps) {
	const { children } = props;

	return <AuthPageLayout header={<LogoHeader />}>{children}</AuthPageLayout>;
}

export default AuthLayout;
