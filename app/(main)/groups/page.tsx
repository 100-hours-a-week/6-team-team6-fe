import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getMyGroupsServer } from "@/features/group/api/getMyGroupsServer";
import { getMyPostsServer } from "@/features/group/api/getMyPostsServer";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import { GROUP_QUERY_STALE_TIME_MS } from "@/features/group/lib/query";
import type { MyPostSummariesResponseDto } from "@/features/group/schemas";
import { GroupListPage } from "@/features/group/screens/GroupListPage";

export default async function Page() {
	const queryClient = new QueryClient();
	const [myGroupsResult, myPostsResult] = await Promise.allSettled([
		queryClient.fetchQuery({
			queryKey: groupQueryKeys.myGroups(),
			queryFn: getMyGroupsServer,
			staleTime: GROUP_QUERY_STALE_TIME_MS,
		}),
		queryClient.fetchInfiniteQuery({
			queryKey: groupQueryKeys.myPosts(),
			queryFn: ({ pageParam }) => getMyPostsServer({ cursor: pageParam }),
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (lastPage: MyPostSummariesResponseDto) =>
				lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
			staleTime: GROUP_QUERY_STALE_TIME_MS,
		}),
	]);

	if (myGroupsResult.status === "rejected") {
		console.error("[GroupList SSR prefetch failed: myGroups]", myGroupsResult.reason);
	}

	if (myPostsResult.status === "rejected") {
		console.error("[GroupList SSR prefetch failed: myPosts]", myPostsResult.reason);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<GroupListPage />
		</HydrationBoundary>
	);
}
