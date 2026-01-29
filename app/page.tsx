import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/auth";
import { routeConst } from "@/shared/lib/constants";

export default async function Page() {
	const session = await getServerSession(authOptions);

	redirect(session ? routeConst.DEFAULT_AUTH_REDIRECT_PATH : "/login");
}
