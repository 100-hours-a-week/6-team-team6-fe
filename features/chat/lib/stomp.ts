export function buildWebSocketEndpoint(apiUrl: string | undefined) {
	if (!apiUrl) {
		return null;
	}

	try {
		const parsed = new URL(apiUrl);
		const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
		return `${protocol}//${parsed.host}/ws`;
	} catch {
		return null;
	}
}

export function buildStompAuthHeaders(authHeader: string) {
	return {
		Authorization: authHeader,
	} as const;
}

export function buildStompJsonHeaders(authHeader: string) {
	return {
		...buildStompAuthHeaders(authHeader),
		"content-type": "application/json",
	} as const;
}
