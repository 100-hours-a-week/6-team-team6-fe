"use client";

import { useEffect, useRef, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";

type ProvidersProps = {
	children: ReactNode;
};

function SessionErrorGuard() {
	const { data: session, status } = useSession();
	const hasSignedOutRef = useRef(false);

	useEffect(() => {
		if (status === "loading" || hasSignedOutRef.current) {
			return;
		}

		if (session?.error === "RefreshAccessTokenError") {
			hasSignedOutRef.current = true;
			signOut({ callbackUrl: "/login" });
		}
	}, [session?.error, status]);

	return null;
}

export default function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<SessionProvider>
			<SessionErrorGuard />
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</SessionProvider>
	);
}
