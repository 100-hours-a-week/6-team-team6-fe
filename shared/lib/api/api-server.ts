import ky from "ky";
import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/auth";

export const apiServer = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL,
	hooks: {
		beforeRequest: [
			async (request) => {
				const session = await getServerSession(authOptions);

				if (session?.accessToken) {
					request.headers.set("Authorization", `Bearer ${session.accessToken}`);
				}
			},
		],
	},
});
