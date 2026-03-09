"use client";

import { MyPageSettingsView } from "@/features/auth/components/MyPageSettingsView";
import useMyProfile from "@/features/auth/hooks/useMyProfile";
import { deletePushToken } from "@/features/notification/api";

import { apiClient, signOutWithChatPendingCleanup } from "@/shared/lib/api/api-client";
import { getPushDeviceId } from "@/shared/lib/push-device";

export function MyPage() {
	const { data: profile, isLoading: isProfileLoading } = useMyProfile();

	const handleLogout = async () => {
		const deviceId = getPushDeviceId();
		if (deviceId) {
			try {
				await deletePushToken(deviceId);
			} catch {}
		}

		try {
			await apiClient.post("auth/logout");
		} finally {
			await signOutWithChatPendingCleanup();
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
