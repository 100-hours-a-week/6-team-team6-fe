"use client";

import { useCallback, useMemo } from "react";

import { notFound, useRouter } from "next/navigation";

import { toast } from "sonner";

import PostEditor from "@/features/post/components/PostEditor";
import usePost from "@/features/post/hooks/usePost";
import type { EditPostPayload, ExistingImage } from "@/features/post/hooks/usePostEditor";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

interface PostEditPageProps {
	groupId: string;
	postId: string;
}

export function PostEditPage(props: PostEditPageProps) {
	const { groupId, postId } = props;
	const router = useRouter();
	const { detailQuery, updateMutation } = usePost({ groupId, postId });
	const { data: post, isLoading, isError, error } = detailQuery;
	const { mutate: updatePost, isPending } = updateMutation;

	const errorCode = error?.code;
	const shouldNotFound =
		errorCode === apiErrorCodes.GROUP_NOT_FOUND || errorCode === apiErrorCodes.POST_NOT_FOUND;

	if (shouldNotFound) {
		notFound();
	}

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

			updatePost(
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
						router.replace(`/groups/${groupId}/posts/${postId}`);
					},
					onError: (updateError) => {
						const message = getApiErrorMessage(updateError?.code ?? "게시글 수정에 실패했습니다.");
						toast.error(message);
					},
				},
			);
		},
		[groupId, imageUrlMap, postId, router, updatePost],
	);

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center gap-2 py-10 text-muted-foreground">
				<Spinner />
				<Typography type="body-sm">게시글 정보를 불러오는 중</Typography>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="h-full flex items-center justify-center py-10 text-muted-foreground">
				<Typography type="body-sm">게시글 정보를 불러오지 못했습니다.</Typography>
			</div>
		);
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
