"use client";

import { GroupListView } from "@/features/group/components/GroupListView";
import { useGroupList } from "@/features/group/hooks/useGroupList";

function GroupListPage() {
	const { state, actions } = useGroupList();

	return <GroupListView state={state} actions={actions} />;
}

export { GroupListPage };
