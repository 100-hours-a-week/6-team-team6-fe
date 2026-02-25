import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { ChatInboxRealtimeBridge } from "@/features/chat/components/ChatInboxRealtimeBridge";
import { WebPushForegroundBridge } from "@/features/notification/components/WebPushForegroundBridge";
import { WebPushRegistrationBridge } from "@/features/notification/components/WebPushRegistrationBridge";

import { authOptions } from "@/shared/lib/auth";

import { AuthSessionProvider } from "@/shared/providers";

interface MainLayoutProps {
	children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
	const session = await getServerSession(authOptions);

	if (!session || session.error) {
		redirect("/login");
	}

	return (
		<AuthSessionProvider session={session} unauthenticatedRedirect="/login">
			<ChatInboxRealtimeBridge />
			<WebPushRegistrationBridge />
			<WebPushForegroundBridge />
			{children}
		</AuthSessionProvider>
	);
}
