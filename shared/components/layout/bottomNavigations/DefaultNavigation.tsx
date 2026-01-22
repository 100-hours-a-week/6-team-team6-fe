"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HomeIcon, MessagesSquareIcon, UserRound } from "lucide-react";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";

import { cn } from "@/shared/lib/utils";

function DefaultNavigation() {
	const pathname = usePathname();
	// TODO: implement - Getting GroupId logic
	const groupId = 1;
	const homeHref = groupId ? `/groups/${groupId}/posts` : "/";

	const navigationItems = [
		{ href: homeHref, label: "홈", icon: HomeIcon },
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
							item.href === homeHref
								? pathname === homeHref || pathname.startsWith(`${homeHref}/`)
								: pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<li key={item.href} className="h-full">
								<Link
									href={item.href}
									className={cn(
										"flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-md text-xs font-medium  ",
										isActive && "text-foreground",
									)}
								>
									<Icon className="size-5" fill={isActive ? "currentColor" : "none"} />
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
