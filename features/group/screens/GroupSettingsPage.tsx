"use client";

import { useRouter } from "next/navigation";

import { GroupSettingsView } from "@/features/group/components/GroupSettingsView";
import { useGroupSettings } from "@/features/group/hooks/useGroupSettings";
import { groupRoutes } from "@/features/group/lib/groupRoutes";

interface GroupSettingsPageProps {
	groupId: string;
}

export function GroupSettingsPage(props: GroupSettingsPageProps) {
	const { groupId } = props;
	const router = useRouter();

	const { state, actions } = useGroupSettings({
		groupId,
		onLeaveGroupSuccess: () => {
			router.push(groupRoutes.list());
		},
	});

	return <GroupSettingsView groupId={groupId} state={state} actions={actions} />;
}
