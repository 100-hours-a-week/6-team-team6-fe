"use client";

import { useEffect, useRef } from "react";

import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import type { ReactNode } from "react";

import { signOutWithChatPendingCleanup } from "@/shared/lib/api/api-client";
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
			signOutWithChatPendingCleanup();
		}
	}, [session?.error, status]);

	return null;
}

function UnauthenticatedRedirectGuard({ redirectTo }: { redirectTo?: string }) {
	const { status } = useSession();
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
			signOutWithChatPendingCleanup(redirectTo);
		}
	}, [redirectTo, status]);

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
