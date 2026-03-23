"use client";

import { useCallback, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	checkPostContent,
	CheckPostContentError,
} from "@/features/post/api/checkPostContent";
import {
	createPost,
	CreatePostError,
	type CreatePostParams,
	type CreatePostResponse,
} from "@/features/post/api/createPost";
import { uploadPostImagesWithErrorHandling } from "@/features/post/api/postImageUtils";
import { postQueryKeys } from "@/features/post/api/postQueryKeys";
import PostEditor from "@/features/post/components/PostEditor";
import { PostStateMessage } from "@/features/post/components/PostStateMessage";
import type { CreatePostPayload } from "@/features/post/hooks/usePostEditor";
import { postRoutes } from "@/features/post/lib/postRoutes";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

export function PostCreatePage() {
	const { groupId } = useParams<{ groupId: string }>();
	const router = useRouter();
	const queryClient = useQueryClient();
	const normalizedGroupId = groupId ?? "";
	const [isPreparingSubmit, setIsPreparingSubmit] = useState(false);
	const listQueryKey = postQueryKeys.list(normalizedGroupId);
	const { mutateAsync: createPostMutateAsync, isPending } = useMutation<
		CreatePostResponse,
		CreatePostError,
		Omit<CreatePostParams, "groupId">
	>({
		mutationFn: (payload) => {
			if (!normalizedGroupId) {
				throw new CreatePostError(400, apiErrorCodes.PARAMETER_INVALID);
			}
			return createPost({ groupId: normalizedGroupId, ...payload });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});

	const handleSubmit = useCallback(
		async (payload: CreatePostPayload) => {
			if (!normalizedGroupId) {
				notFound();
			}

			if (isPreparingSubmit || isPending) {
				return;
			}

			setIsPreparingSubmit(true);

			try {
				const imageUrls = await uploadPostImagesWithErrorHandling(
					payload.newImages,
					(status, code) => new CreatePostError(status, code),
				);
				await checkPostContent({
					imageUrls,
					title: payload.title,
					content: payload.content,
				});
				const data = await createPostMutateAsync({
					title: payload.title,
					content: payload.content,
					rentalFee: payload.rentalFee,
					feeUnit: payload.feeUnit,
					imageUrls,
				});
				toast.success("게시글이 등록되었습니다.");
				router.replace(postRoutes.postDetail(normalizedGroupId, data.postId));
			} catch (error) {
				const errorCode =
					error instanceof CreatePostError || error instanceof CheckPostContentError
						? error.code
						: undefined;

				if (errorCode === apiErrorCodes.GROUP_NOT_FOUND) {
					notFound();
					return;
				}

				const message =
					getApiErrorMessage(errorCode) ??
					(error instanceof CheckPostContentError
						? "게시글 AI 검증에 실패했습니다."
						: "게시글 등록에 실패했습니다.");
				toast.error(message);
			} finally {
				setIsPreparingSubmit(false);
			}
		},
		[createPostMutateAsync, isPending, isPreparingSubmit, normalizedGroupId, router],
	);

	if (!normalizedGroupId) {
		return <PostStateMessage label="그룹 정보를 불러오는 중" showSpinner fullHeight />;
	}

	return (
		<div className="relative">
			<TitleBackHeader title="내 물품 등록" />
			<PostEditor
				mode="create"
				defaultValues={{ title: "", content: "", rentalFee: 0, feeUnit: "HOUR" }}
				isSubmitting={isPending || isPreparingSubmit}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
