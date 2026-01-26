"use client";

import ky from "ky";
import { getSession, signOut } from "next-auth/react";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import StatusCodes from "@/shared/lib/api/status-codes";

export const apiClient = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL,
	throwHttpErrors: false,
	hooks: {
		beforeRequest: [
			async (request) => {
				// 1. 세션에서 accessToken 읽어서 Authorization 헤더에 추가
				const session = await getSession();
				if (session?.accessToken) {
					request.headers.set("Authorization", `Bearer ${session.accessToken}`);
				}

				// 2. CSRF 이중 제출: 쿠키의 XSRF-TOKEN 값을 X-XSRF-TOKEN 헤더로 복사
				const xsrfToken = document.cookie
					.split("; ")
					.find((row) => row.startsWith("XSRF-TOKEN="))
					?.split("=")[1];

				if (xsrfToken) {
					request.headers.set("X-XSRF-TOKEN", xsrfToken);
				}
			},
		],
		afterResponse: [
			async (request, options, response) => {
				if (response.status !== StatusCodes.UNAUTHORIZED) {
					return;
				}

				let data = null;

				try {
					data = await response.clone().json();
				} catch {
					// JSON 형식이 아니면 처리 불가 → 그냥 상위에서 에러 처리하게 둠
					return;
				}

				const errorCode = data?.errorCode;
				const alreadyRetried = request.headers.get("X-Retried") === "true";

				// 1) Access Token 관련 인증 실패 → 세션 새로 받아서 한 번만 재시도
				if (!alreadyRetried && errorCode === apiErrorCodes.AUTH_FAILED) {
					const newSession = await getSession(); // jwt callback -> refreshAccessToken 실행

					if (newSession?.accessToken) {
						request.headers.set("Authorization", `Bearer ${newSession.accessToken}`);
						request.headers.set("X-Retried", "true");

						// 같은 인스턴스로 재요청
						return apiClient(request, options);
					}

					return;
				}

				// 2) Refresh Token 만료/폐기
				if (
					errorCode === apiErrorCodes.EXPIRED_REFRESH_TOKEN ||
					errorCode === apiErrorCodes.INVALID_REFRESH_TOKEN ||
					errorCode === apiErrorCodes.REVOKED_REFRESH_TOKEN
				) {
					await signOut({ callbackUrl: "/login" });
					return;
				}

				// 그 외 401은 별도 처리 안 하고 그대로 리턴
				return;
			},
		],
	},
});
