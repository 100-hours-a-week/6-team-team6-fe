import { NextResponse } from "next/server";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { apiErrorMessageMap } from "@/shared/lib/error-message-map";

const MOCK_ACCESS_TOKEN = "mock-access-token-refreshed";

export async function POST(request: Request) {
	const refreshToken = request.headers.get("cookie")?.includes("refreshToken=");
	if (!refreshToken) {
		return NextResponse.json(
			{
				code: apiErrorCodes.AUTH_MISSING_TOKEN,
				message: apiErrorMessageMap[apiErrorCodes.AUTH_MISSING_TOKEN],
			},
			{ status: 401 },
		);
	}

	return NextResponse.json({ accessToken: MOCK_ACCESS_TOKEN });
}
