import { notFound } from "next/navigation";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getPostDetailServer } from "@/features/post/api/getPostDetailServer";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import { PostDetailForbiddenRedirect } from "@/features/post/components/PostDetailForbiddenRedirect";
import {
	isBadRequestParameterError,
	isEditForbiddenError,
	isNotFoundError,
	POST_DETAIL_STALE_TIME_MS,
} from "@/features/post/lib/postDetailRouteGuards";
import { PostEditPage } from "@/features/post/screens/PostEditPage";

import { isNumericPathParam } from "@/shared/lib/path-params";

interface PostEditPageProps {
	params: Promise<{ groupId: string; postId: string }>;
}

export default async function Page(props: PostEditPageProps) {
	const { groupId, postId } = await props.params;

	if (!isNumericPathParam(groupId) || !isNumericPathParam(postId)) {
		notFound();
	}

	const queryClient = new QueryClient();
	let isNotSeller = false;

	try {
		const postDetail = await queryClient.fetchQuery({
			queryKey: postQueryKeys.detail(groupId, postId),
			queryFn: () => getPostDetailServer({ groupId, postId }),
			staleTime: POST_DETAIL_STALE_TIME_MS,
		});

		isNotSeller = !postDetail.isSeller;
	} catch (error) {
		if (isNotFoundError(error) || isBadRequestParameterError(error)) {
			notFound();
		}

		if (isEditForbiddenError(error)) {
			return <PostDetailForbiddenRedirect />;
		}

		console.error("[PostEdit SSR prefetch failed]", { groupId, postId, error });
	}

	if (isNotSeller) {
		return <PostDetailForbiddenRedirect />;
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PostEditPage groupId={groupId} postId={postId} />
		</HydrationBoundary>
	);
}
