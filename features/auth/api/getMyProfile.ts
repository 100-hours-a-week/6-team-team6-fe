"use client";

import type { MyProfileResponseDto } from "@/features/auth/schemas";
import { myProfileResponseSchema } from "@/features/auth/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { request } from "@/shared/lib/api/request";

type GetMyProfileParams = void;

class GetMyProfileError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "GetMyProfileError";
		this.status = status;
		this.code = code;
	}
}

async function getMyProfile(_params?: GetMyProfileParams): Promise<MyProfileResponseDto> {
	return request(apiClient.get("users/me"), myProfileResponseSchema, GetMyProfileError);
}

export type { GetMyProfileParams };
export { getMyProfile, GetMyProfileError };
