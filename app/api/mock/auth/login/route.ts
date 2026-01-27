import { NextResponse } from "next/server";

const MOCK_ACCESS_TOKEN = "mock-access-token";
const MOCK_REFRESH_TOKEN = "mock-refresh-token";
const MOCK_USER_ID = "mock-user-id";
const MOCK_LOGIN_ID = "test1234";
const MOCK_PASSWORD = "Password123!";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const loginId = typeof body?.loginId === "string" ? body.loginId : "";
	const password = typeof body?.password === "string" ? body.password : "";

	if (!loginId || !password || loginId !== MOCK_LOGIN_ID || password !== MOCK_PASSWORD) {
		return NextResponse.json(
			{ errorCode: "LOGIN_FAILED", message: "Invalid credentials" },
			{ status: 401 },
		);
	}

	const response = NextResponse.json({
		userId: MOCK_USER_ID,
		accessToken: MOCK_ACCESS_TOKEN,
	});

	response.cookies.set("refreshToken", MOCK_REFRESH_TOKEN, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
	response.cookies.set("XSRF-TOKEN", "mock-xsrf-token", {
		httpOnly: false,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	return response;
}
