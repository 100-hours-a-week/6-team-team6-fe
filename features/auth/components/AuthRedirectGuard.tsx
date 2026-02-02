"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { routeConst } from "@/shared/lib/constants";

function AuthRedirectGuard() {
	const router = useRouter();
	const { status, data: session } = useSession();

	useEffect(() => {
		if (status === "authenticated" && !session?.error) {
			router.replace(routeConst.DEFAULT_AUTH_REDIRECT_PATH);
		}
	}, [router, session?.error, status]);

	return null;
}

export default AuthRedirectGuard;
