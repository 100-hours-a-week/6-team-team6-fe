"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import type { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

import { clearSession, setSession } from "@/shared/lib/auth/session-store";

type AuthSessionProviderProps = {
	children: ReactNode;
	session?: Session | null;
	unauthenticatedRedirect?: string;
};

function SessionBridge() {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "loading") {
			return;
		}

		if (session) {
			setSession(session);
			return;
		}

		clearSession();
	}, [session, status]);

	return null;
}

function SessionErrorGuard() {
	const { data: session, status } = useSession();
	const hasSignedOutRef = useRef(false);

	useEffect(() => {
		if (status === "loading" || hasSignedOutRef.current) {
			return;
		}

		if (session?.error === "RefreshAccessTokenError") {
			hasSignedOutRef.current = true;
			clearSession();
			signOut({ callbackUrl: "/login" });
		}
	}, [session?.error, status]);

	return null;
}

function UnauthenticatedRedirectGuard({ redirectTo }: { redirectTo?: string }) {
	const { status } = useSession();
	const router = useRouter();
	const hasRedirectedRef = useRef(false);

	useEffect(() => {
		if (!redirectTo) {
			return;
		}

		if (status === "loading") {
			return;
		}

		if (status === "authenticated") {
			hasRedirectedRef.current = false;
			return;
		}

		if (!hasRedirectedRef.current && status === "unauthenticated") {
			hasRedirectedRef.current = true;
			clearSession();
			router.replace(redirectTo);
		}
	}, [redirectTo, router, status]);

	return null;
}

export default function AuthSessionProvider({
	children,
	session,
	unauthenticatedRedirect,
}: AuthSessionProviderProps) {
	return (
		<SessionProvider session={session} refetchOnWindowFocus refetchInterval={0}>
			<SessionBridge />
			<SessionErrorGuard />
			<UnauthenticatedRedirectGuard redirectTo={unauthenticatedRedirect} />
			{children}
		</SessionProvider>
	);
}
