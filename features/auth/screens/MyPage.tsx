"use client";

import { signOut } from "next-auth/react";

import useMyProfile from "@/features/auth/hooks/useMyProfile";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { apiClient } from "@/shared/lib/api/api-client";

export function MyPage() {
	const { data: profile, isLoading: isProfileLoading } = useMyProfile();
	const avatarUrl = profile?.avatarImageUrl;

	const handleLogout = async () => {
		try {
			await apiClient.post("auth/logout");
		} finally {
			await signOut({ callbackUrl: "/login" });
		}
	};

	if (isProfileLoading) {
		return <Skeleton />;
	}

	return (
		<div className="flex flex-1 flex-col gap-y-4 items-center h-full">
			<Avatar className="h-24 w-24 border-0">
				<AvatarImage src={avatarUrl} />
				<AvatarFallback></AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-y-2 justify-start">
				<span className="text-sm text-muted-foreground">아이디</span>

				<p className="text-xl font-medium text-foreground">{profile?.loginId}</p>
			</div>
			<div>
				<Button onClick={handleLogout}>로그아웃</Button>
			</div>
		</div>
	);
}
