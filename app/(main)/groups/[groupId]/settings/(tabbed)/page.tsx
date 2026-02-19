import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getGroupSettingsServer } from "@/features/group/api/getGroupSettingsServer";
import { getMyGroupMembershipServer } from "@/features/group/api/getMyGroupMembershipServer";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import { GROUP_QUERY_STALE_TIME_MS } from "@/features/group/lib/query";
import { GroupSettingsPage } from "@/features/group/screens/GroupSettingsPage";

interface GroupSettingsRoutePageProps {
	params: Promise<{
		groupId: string;
	}>;
}

export default async function Page(props: GroupSettingsRoutePageProps) {
	const { groupId } = await props.params;
	const queryClient = new QueryClient();
	const [groupSettingsResult, membershipResult] = await Promise.allSettled([
		queryClient.fetchQuery({
			queryKey: groupQueryKeys.detail(groupId),
			queryFn: () => getGroupSettingsServer(groupId),
			staleTime: GROUP_QUERY_STALE_TIME_MS,
		}),
		queryClient.fetchQuery({
			queryKey: groupQueryKeys.membershipMe(groupId),
			queryFn: () => getMyGroupMembershipServer(groupId),
			staleTime: GROUP_QUERY_STALE_TIME_MS,
		}),
	]);

	if (groupSettingsResult.status === "rejected") {
		console.error(
			"[GroupSettings SSR prefetch failed: group detail]",
			groupSettingsResult.reason,
		);
	}

	if (membershipResult.status === "rejected") {
		console.error(
			"[GroupSettings SSR prefetch failed: membership me]",
			membershipResult.reason,
		);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<GroupSettingsPage groupId={groupId} />
		</HydrationBoundary>
	);
}
