"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type ProvidersProps = {
	children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</SessionProvider>
	);
}
