import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getPostDetailServer } from "@/features/post/api/getPostDetailServer";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import { PostDetailPage } from "@/features/post/screens/PostDetailPage";

const POST_DETAIL_STALE_TIME_MS = 60_000;

interface PostDetailRoutePageProps {
	params: Promise<{ groupId: string; postId: string }>;
}

export default async function Page(props: PostDetailRoutePageProps) {
	const { groupId, postId } = await props.params;
	const queryClient = new QueryClient();

	try {
		await queryClient.prefetchQuery({
			queryKey: postQueryKeys.detail(groupId, postId),
			queryFn: () => getPostDetailServer({ groupId, postId }),
			staleTime: POST_DETAIL_STALE_TIME_MS,
		});
	} catch {
		//
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PostDetailPage />
		</HydrationBoundary>
	);
}
