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
