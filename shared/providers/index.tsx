"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

type ProvidersProps = {
	children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(() => new QueryClient());

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { default as AuthSessionProvider } from "./AuthSessionProvider";
