"use client";

import { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { postQueries } from "@/features/post/api/postQueries";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import {
	updatePost,
	UpdatePostError,
	type UpdatePostParams,
	type UpdatePostResponse,
} from "@/features/post/api/updatePost";
import PostEditor from "@/features/post/components/PostEditor";
import { PostStateMessage } from "@/features/post/components/PostStateMessage";
import type { EditPostPayload, ExistingImage } from "@/features/post/hooks/usePostEditor";
import { postRoutes } from "@/features/post/lib/postRoutes";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

interface PostEditPageProps {
	groupId: string;
	postId: string;
}

export function PostEditPage(props: PostEditPageProps) {
	const { groupId, postId } = props;
	const router = useRouter();
	const queryClient = useQueryClient();
	const detailQueryKey = postQueryKeys.detail(groupId, postId);
	const listQueryKey = postQueryKeys.list(groupId);
	const canUsePost = Boolean(groupId) && Boolean(postId);
	const detailQuery = useQuery(postQueries.detail({ groupId, postId, enabled: canUsePost }));
	const updateMutation = useMutation<
		UpdatePostResponse,
		UpdatePostError,
		Omit<UpdatePostParams, "groupId" | "postId">
	>({
		mutationFn: (payload) => {
			if (!canUsePost) {
				throw new UpdatePostError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return updatePost({ groupId, postId, ...payload });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: detailQueryKey });
			queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});
	const { data: post, isLoading } = detailQuery;
	const { mutate: mutateUpdatePost, isPending } = updateMutation;

	const existingImages = useMemo<ExistingImage[]>(() => {
		if (!post) {
			return [];
		}
		return post.imageUrls.imageInfos.map((image) => ({
			id: String(image.postImageId),
			url: image.imageUrl,
		}));
	}, [post]);

	const imageUrlMap = useMemo(() => {
		if (!post) {
			return new Map<string, string>();
		}
		return new Map(
			post.imageUrls.imageInfos.map((image) => [String(image.postImageId), image.imageUrl]),
		);
	}, [post]);

	const handleSubmit = useCallback(
		(payload: EditPostPayload) => {
			const imageUrls = payload.keepImageIds.flatMap((id) => {
				const url = imageUrlMap.get(id);
				if (!url) {
					return [];
				}
				return [{ postImageId: Number(id), imageUrl: url }];
			});

			mutateUpdatePost(
				{
					title: payload.title,
					content: payload.content,
					rentalFee: payload.rentalFee,
					feeUnit: payload.feeUnit,
					imageUrls,
					newImages: payload.newImages,
				},
				{
					onSuccess: () => {
						toast.success("게시글이 수정되었습니다.");
						router.replace(postRoutes.postDetail(groupId, postId));
					},
					onError: (updateError) => {
						const message = getApiErrorMessage(updateError?.code ?? "게시글 수정에 실패했습니다.");
						toast.error(message);
					},
				},
			);
		},
		[groupId, imageUrlMap, mutateUpdatePost, postId, router],
	);

	if (isLoading) {
		return <PostStateMessage label="게시글 정보를 불러오는 중" showSpinner fullHeight />;
	}

	if (!post) {
		return <PostStateMessage label="게시글 정보를 불러오지 못했습니다." fullHeight />;
	}

	return (
		<div className="relative">
			<TitleBackHeader title="내 물품 수정" />
			<PostEditor
				mode="edit"
				postId={postId}
				isSubmitting={isPending}
				initialValues={{
					title: post.title,
					content: post.content,
					rentalFee: post.rentalFee,
					feeUnit: post.feeUnit,
					images: existingImages,
				}}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
