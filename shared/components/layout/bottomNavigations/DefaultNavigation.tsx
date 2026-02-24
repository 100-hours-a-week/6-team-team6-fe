"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MessagesSquareIcon, UserRound, UsersIcon } from "lucide-react";

import useUnreadChatCount from "@/features/chat/hooks/useUnreadChatCount";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";

import { cn } from "@/shared/lib/utils";

function DefaultNavigation() {
	const pathname = usePathname();
	const { data: unreadData } = useUnreadChatCount();
	// TODO: fix field name
	const unreadCount = unreadData?.unreadChatMesageCount ?? 0;
	const groupListHref = "/groups";

	const navigationItems = [
		{ href: groupListHref, label: "그룹리스트", icon: UsersIcon },
		{ href: "/chat", label: "채팅", icon: MessagesSquareIcon },
		{ href: "/mypage", label: "마이페이지", icon: UserRound },
	];

	return (
		<NavigationLayout>
			<div className="h-11 w-full">
				<ul className="grid h-full w-full grid-cols-3">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive =
							item.href === groupListHref
								? pathname === groupListHref || pathname.startsWith(`${groupListHref}/`)
								: pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<li key={item.href} className="h-full">
								<Link
									href={item.href}
									className={cn(
										" flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md text-xs font-medium  ",
										isActive && "text-foreground",
									)}
								>
									<div className="relative">
										<Icon className="size-5" fill={isActive ? "currentColor" : "none"} />
										{item.label === "채팅" && unreadCount > 0 && (
											<div className="absolute -top-2 -right-5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
												{unreadCount > 99 ? "99+" : unreadCount}
											</div>
										)}
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

export default DefaultNavigation;
