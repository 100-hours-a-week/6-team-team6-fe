import { NextResponse } from "next/server";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { apiErrorMessageMap } from "@/shared/lib/error-message-map";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const loginId = typeof body?.loginId === "string" ? body.loginId : "";
	const password = typeof body?.password === "string" ? body.password : "";

	if (!loginId || !password) {
		return NextResponse.json(
			{
				code: apiErrorCodes.PARAMETER_INVALID,
				message: apiErrorMessageMap[apiErrorCodes.PARAMETER_INVALID],
			},
			{ status: 400 },
		);
	}

	return NextResponse.json({ ok: true }, { status: 201 });
}
