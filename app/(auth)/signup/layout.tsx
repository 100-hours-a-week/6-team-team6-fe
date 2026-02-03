import React from "react";

import AuthPageLayout from "@/features/auth/components/AuthPageLayout";

import LogoBackHeader from "@/shared/components/layout/headers/LogoBackHeader";

interface AuthLayoutProps {
	children: React.ReactNode;
}

function AuthLayout(props: AuthLayoutProps) {
	const { children } = props;

	return <AuthPageLayout header={<LogoBackHeader />}>{children}</AuthPageLayout>;
}

export default AuthLayout;
