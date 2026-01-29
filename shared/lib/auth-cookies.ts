import { cookies } from "next/headers";

type ParsedCookie = {
	name: string;
	value: string;
	maxAge?: number;
};

type PersistedAuthCookies = {
	refreshToken?: string;
	xsrfToken?: string;
};

function getSetCookieHeaders(response: Response) {
	const headers = response.headers as { getSetCookie?: () => string[] };
	if (typeof headers.getSetCookie === "function") {
		return headers.getSetCookie();
	}

	const header = response.headers.get("set-cookie");
	if (!header) {
		return [];
	}

	return header.split(/,(?=[^;]+=[^;]+)/);
}

function parseSetCookieLine(cookieString: string): ParsedCookie | null {
	const segments = cookieString.split(";").map((part) => part.trim());
	const nameValue = segments[0] ?? "";
	const separatorIndex = nameValue.indexOf("=");

	if (separatorIndex <= 0) {
		return null;
	}

	const name = nameValue.slice(0, separatorIndex);
	const value = nameValue.slice(separatorIndex + 1);
	const maxAgeSegment = segments.find((segment) => segment.toLowerCase().startsWith("max-age="));
	const maxAgeValue = maxAgeSegment?.split("=")[1];
	const maxAge = maxAgeValue ? Number(maxAgeValue) : undefined;

	return {
		name,
		value,
		maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
	};
}

export async function persistAuthCookies(response: Response): Promise<PersistedAuthCookies> {
	const cookieStore = await cookies();
	const isProduction = process.env.NODE_ENV === "production";
	const cookieHeaders = getSetCookieHeaders(response);
	const persisted: PersistedAuthCookies = {};

	for (const cookieHeader of cookieHeaders) {
		const parsed = parseSetCookieLine(cookieHeader);
		if (!parsed) {
			continue;
		}

		if (parsed.name !== "refreshToken" && parsed.name !== "XSRF-TOKEN") {
			continue;
		}

		if (parsed.name === "refreshToken") {
			persisted.refreshToken = parsed.value;
		}

		if (parsed.name === "XSRF-TOKEN") {
			persisted.xsrfToken = parsed.value;
		}

		cookieStore.set({
			name: parsed.name,
			value: parsed.value,
			httpOnly: parsed.name === "refreshToken",
			secure: isProduction,
			sameSite: "lax",
			path: "/",
			...(parsed.maxAge ? { maxAge: parsed.maxAge } : {}),
		});
	}

	return persisted;
}
