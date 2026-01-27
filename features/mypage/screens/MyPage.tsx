"use client";

import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

export function MyPage() {
	const { data: session, status } = useSession();
	const isLoading = status === "loading";
	const userId = session?.user?.id;
	const userIdLabel = isLoading ? "불러오는 중..." : (userId ?? "로그인이 필요합니다");

	return (
		<div className="flex flex-1 flex-col gap-y-4 items-center h-full">
			<Avatar className="h-24 w-24 border-0">
				<AvatarImage src="/default-profile.png" />
				<AvatarFallback></AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-y-2 justify-start">
				<span className="text-sm text-muted-foreground">아이디</span>

				<p className="text-xl font-medium text-foreground">{userIdLabel}</p>
			</div>
			<div>
				<Button
					onClick={() => signOut({ callbackUrl: "/login" })}
					disabled={status !== "authenticated"}
				>
					로그아웃
				</Button>
			</div>
		</div>
	);
}
