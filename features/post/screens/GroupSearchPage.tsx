"use client";

import { GroupSearchView } from "@/features/post/components/GroupSearchView";
import { useGroupSearch } from "@/features/post/hooks/useGroupSearch";

interface GroupSearchPageProps {
	groupId: string;
}

export function GroupSearchPage(props: GroupSearchPageProps) {
	const { groupId } = props;
	const searchState = useGroupSearch();

	return <GroupSearchView groupId={groupId} {...searchState} />;
}
