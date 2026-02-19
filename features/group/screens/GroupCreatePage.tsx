"use client";

import { useRouter } from "next/navigation";

import { GroupCreateView } from "@/features/group/components/GroupCreateView";
import { useGroupCreate } from "@/features/group/hooks/useGroupCreate";
import { groupRoutes } from "@/features/group/lib/groupRoutes";

function GroupCreatePage() {
	const router = useRouter();
	const { state, actions } = useGroupCreate({
		onCreateSuccess: () => {
			router.replace(groupRoutes.list());
		},
	});

	return <GroupCreateView state={state} actions={actions} />;
}

export { GroupCreatePage };
