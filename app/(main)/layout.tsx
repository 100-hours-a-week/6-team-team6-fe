import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/shared/lib/auth";

interface MainLayoutProps {
	children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
	const session = await getServerSession(authOptions);

	if (!session || session.error) {
		redirect("/login");
	}

	return <>{children}</>;
}
