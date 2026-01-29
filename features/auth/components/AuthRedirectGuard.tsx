"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { routeConst } from "@/shared/lib/constants";

function AuthRedirectGuard() {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace(routeConst.DEFAULT_AUTH_REDIRECT_PATH);
		}
	}, [router, status]);

	return null;
}

export default AuthRedirectGuard;
