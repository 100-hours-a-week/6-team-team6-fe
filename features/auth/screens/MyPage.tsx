"use client";

import { signOut } from "next-auth/react";

import { MyPageSettingsView } from "@/features/auth/components/MyPageSettingsView";
import useMyProfile from "@/features/auth/hooks/useMyProfile";

import { apiClient } from "@/shared/lib/api/api-client";

export function MyPage() {
	const { data: profile, isLoading: isProfileLoading } = useMyProfile();

	const handleLogout = async () => {
		try {
			await apiClient.post("auth/logout");
		} finally {
			await signOut({ callbackUrl: "/login" });
		}
	};

	return (
		<MyPageSettingsView
			loginId={profile?.loginId}
			avatarImageUrl={profile?.avatarImageUrl}
			isProfileLoading={isProfileLoading}
			onLogout={handleLogout}
		/>
	);
}
