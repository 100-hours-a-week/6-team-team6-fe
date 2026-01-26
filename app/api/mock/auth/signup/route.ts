import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const loginId = typeof body?.loginId === "string" ? body.loginId : "";
	const password = typeof body?.password === "string" ? body.password : "";

	if (!loginId || !password) {
		return NextResponse.json(
			{ errorCode: "INVALID_LOGIN_ID_INPUT", message: "Invalid credentials" },
			{ status: 400 },
		);
	}

	return NextResponse.json({ ok: true }, { status: 201 });
}
