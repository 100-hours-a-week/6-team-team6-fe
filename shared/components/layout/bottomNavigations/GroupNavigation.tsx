"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Box, MessagesSquareIcon, PackageIcon, PackageOpen, SettingsIcon } from "lucide-react";

import useUnreadChatCount from "@/features/chat/hooks/useUnreadChatCount";
import { groupRoutes } from "@/features/group/lib/groupRoutes";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";

import { cn } from "@/shared/lib/utils";

interface GroupNavigationProps {
	groupId: string;
}

function GroupNavigation(props: GroupNavigationProps) {
	const { groupId } = props;
	const pathname = usePathname();
	const { data: unreadData } = useUnreadChatCount();
	// TODO: fix field name
	const unreadCount = unreadData?.unreadChatMesageCount ?? 0;

	const postsHref = groupRoutes.posts(groupId);
	const settingsHref = groupRoutes.settings(groupId);
	const chatHref = "/chat";

	const navigationItems = [
		{
			href: postsHref,
			label: "물품리스트",
			icon: PackageIcon,
			isActive: pathname === postsHref || pathname.startsWith(`${postsHref}/`),
		},
		{
			href: chatHref,
			label: "채팅",
			icon: MessagesSquareIcon,
			isActive: pathname === chatHref || pathname.startsWith(`${chatHref}/`),
		},
		{
			href: settingsHref,
			label: "그룹 설정",
			icon: SettingsIcon,
			isActive: pathname === settingsHref || pathname.startsWith(`${settingsHref}/`),
		},
	] as const;

	return (
		<NavigationLayout>
			<div className="h-11 w-full">
				<ul className="grid h-full w-full grid-cols-3">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						return (
							<li key={item.href} className="h-full">
								<Link
									href={item.href}
									className={cn(
										"flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md text-xs font-medium",
										item.isActive && "text-foreground",
									)}
								>
									<div className="relative">
										<Icon className="size-5" fill={item.isActive ? "currentColor" : "none"} />
										{item.label === "채팅" && unreadCount > 0 ? (
											<div className="absolute -top-2 -right-5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
												{unreadCount > 99 ? "99+" : unreadCount}
											</div>
										) : null}
									</div>
									<span>{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</NavigationLayout>
	);
}

export default GroupNavigation;
