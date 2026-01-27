import { NextResponse } from "next/server";

const MOCK_ACCESS_TOKEN = "mock-access-token-refreshed";

export async function POST(request: Request) {
	const refreshToken = request.headers.get("cookie")?.includes("refreshToken=");
	if (!refreshToken) {
		return NextResponse.json(
			{ errorCode: "INVALID_REFRESH_TOKEN", message: "Missing refresh token" },
			{ status: 401 },
		);
	}

	return NextResponse.json({ accessToken: MOCK_ACCESS_TOKEN });
}
