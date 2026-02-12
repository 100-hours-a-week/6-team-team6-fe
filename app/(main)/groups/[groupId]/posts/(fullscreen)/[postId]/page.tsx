import { notFound } from "next/navigation";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getPostDetailServer } from "@/features/post/api/getPostDetailServer";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import { PostDetailForbiddenRedirect } from "@/features/post/components/PostDetailForbiddenRedirect";
import {
	isBadRequestParameterError,
	isForbiddenError,
	isNotFoundError,
	POST_DETAIL_STALE_TIME_MS,
} from "@/features/post/lib/postDetailRouteGuards";
import { PostDetailPage } from "@/features/post/screens/PostDetailPage";

import { isNumericPathParam } from "@/shared/lib/path-params";

interface PostDetailRoutePageProps {
	params: Promise<{ groupId: string; postId: string }>;
}

export default async function Page(props: PostDetailRoutePageProps) {
	const { groupId, postId } = await props.params;

	if (!isNumericPathParam(groupId) || !isNumericPathParam(postId)) {
		notFound();
	}

	const queryClient = new QueryClient();

	try {
		await queryClient.fetchQuery({
			queryKey: postQueryKeys.detail(groupId, postId),
			queryFn: () => getPostDetailServer({ groupId, postId }),
			staleTime: POST_DETAIL_STALE_TIME_MS,
		});
	} catch (error) {
		if (isNotFoundError(error) || isBadRequestParameterError(error)) {
			notFound();
		}

		if (isForbiddenError(error)) {
			return <PostDetailForbiddenRedirect />;
		}

		console.error("[PostDetail SSR prefetch failed]", { groupId, postId, error });
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PostDetailPage />
		</HydrationBoundary>
	);
}
