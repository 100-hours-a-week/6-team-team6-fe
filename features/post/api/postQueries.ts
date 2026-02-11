import { queryOptions } from "@tanstack/react-query";

import {
	getPostDetail,
	type GetPostDetailParams,
	type PostDetailError,
} from "@/features/post/api/getPostDetail";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import type { PostDetailDto } from "@/features/post/schemas";

const POST_DETAIL_STALE_TIME_MS = 60_000;

const postQueries = {
	detail: (params: GetPostDetailParams & { enabled?: boolean }) => {
		const { groupId, postId, enabled = true } = params;
		return queryOptions<PostDetailDto, PostDetailError>({
			queryKey: postQueryKeys.detail(groupId, postId),
			queryFn: () => getPostDetail({ groupId, postId }),
			enabled: Boolean(groupId) && Boolean(postId) && enabled,
			staleTime: POST_DETAIL_STALE_TIME_MS,
		});
	},
};

export { postQueries };
