import { cookies } from "next/headers";

import ky from "ky";
import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { persistAuthCookies } from "@/shared/lib/auth-cookies";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				loginId: { label: "Login ID", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						loginId: credentials?.loginId,
						password: credentials?.password,
					}),
				});

				const data = await res.json();

				if (!res.ok) {
					// 400, 401 에러 코드 처리 (USER02, AUTH01 등)
					throw new Error(data.code ?? "UNKNOWN_ERROR");
				}

				const { xsrfToken } = await persistAuthCookies(res);
				return {
					id: data.userId, // TODO: API 확인
					accessToken: data.accessToken,
					xsrfToken,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			// 1. 초기 로그인 시
			if (user) {
				const userId = user.id ? String(user.id) : undefined;
				const xsrfToken = user.xsrfToken ?? (await getAuthCookieValues()).xsrfToken;

				return {
					...token,
					accessToken: user.accessToken,
					accessTokenExpires: Date.now() + 1000 * 60 * 60, // 1시간
					userId,
					xsrfToken, // 재발행 시 헤더에 반영 필요
				};
			}

			// 2. 만료 전 업데이트 요청 시
			if (trigger === "update") {
				return await refreshAccessToken(token);
			}

			// 3. 토큰 만료 여부 확인
			if (Date.now() < (token.accessTokenExpires as number)) {
				return token;
			}

			// 4. 만료 시 자동 갱신
			return await refreshAccessToken(token);
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.xsrfToken = token.xsrfToken; // 클라이언트 API 호출 시 필요
			session.error = token.error;
			if (token.userId) {
				session.user = { ...(session.user ?? {}), id: token.userId };
			}
			return session;
		},
	},
	events: {
		async signOut({ token }) {
			// 1. 백엔드 세션 무효화 (RefreshToken 무효화)
			const { cookieStore, refreshToken, xsrfToken } = await getAuthCookieValues();
			const effectiveXsrfToken = (token.xsrfToken as string | undefined) ?? xsrfToken;

			try {
				await ky.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
					headers: buildXsrfHeaders(effectiveXsrfToken),
					hooks: getRefreshTokenCookieHooks(refreshToken),
				});
			} catch (error) {
				console.error("Backend logout failed:", error);
			}

			cookieStore.delete("refreshToken");
			cookieStore.delete("XSRF-TOKEN");
		},
	},
};

async function refreshAccessToken(token: JWT) {
	try {
		const { cookieStore, refreshToken, xsrfToken } = await getAuthCookieValues();

		const response = await ky.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/tokens`, {
			headers: buildXsrfHeaders(token.xsrfToken ?? xsrfToken),
			// 서버 사이드 요청 시 쿠키를 직접 주입해야 할 경우
			hooks: getRefreshTokenCookieHooks(refreshToken),
		});

		const data = await response.json<{ accessToken: string }>();

		// 새로운 XSRF-TOKEN이 쿠키로 내려왔는지 확인 후 세션 업데이트
		const newXsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

		return {
			...token,
			accessToken: data.accessToken,
			accessTokenExpires: Date.now() + 1000 * 60 * 60,
			xsrfToken: newXsrfToken || token.xsrfToken,
		};
	} catch (error) {
		// 401(TOKEN02 등) 혹은 403(CSRF 관련) 발생 시
		return {
			...token,
			error: "RefreshAccessTokenError",
		};
	}
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function getAuthCookieValues(): Promise<{
	cookieStore: CookieStore;
	refreshToken?: string;
	xsrfToken?: string;
}> {
	const cookieStore = await cookies();

	return {
		cookieStore,
		refreshToken: cookieStore.get("refreshToken")?.value,
		xsrfToken: cookieStore.get("XSRF-TOKEN")?.value,
	};
}

function buildXsrfHeaders(xsrfToken?: string) {
	return xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {};
}

function getRefreshTokenCookieHooks(refreshToken?: string) {
	return {
		beforeRequest: [
			(request: Request) => {
				if (refreshToken) {
					request.headers.set("Cookie", `refreshToken=${refreshToken}`);
				}
			},
		],
	};
}
