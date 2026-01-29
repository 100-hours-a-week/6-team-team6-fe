"use client";

import { useCallback } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import PostEditor from "@/features/post/components/PostEditor";
import usePost from "@/features/post/hooks/usePost";
import type { CreatePostPayload } from "@/features/post/hooks/usePostEditor";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";

export function PostCreatePage() {
	const { groupId } = useParams<{ groupId: string }>();
	const router = useRouter();
	const normalizedGroupId = groupId ?? "";
	const { createMutation } = usePost({ groupId: normalizedGroupId });
	const { mutate: createPost, isPending } = createMutation;

	const handleSubmit = useCallback(
		(payload: CreatePostPayload) => {
			if (!normalizedGroupId) {
				notFound();
				return;
			}

			createPost(
				{
					title: payload.title,
					content: payload.content,
					rentalFee: payload.rentalFee,
					feeUnit: payload.feeUnit,
					newImages: payload.newImages,
				},
				{
					onSuccess: (data) => {
						toast.success("게시글이 등록되었습니다.");
						router.replace(`/groups/${normalizedGroupId}/posts/${data.postId}`);
					},
					onError: (createError) => {
						const errorCode = createError?.code;
						if (errorCode === apiErrorCodes.GROUP_NOT_FOUND) {
							notFound();
							return;
						}
						const message = getApiErrorMessage(errorCode) ?? "게시글 등록에 실패했습니다.";
						toast.error(message);
					},
				},
			);
		},
		[createPost, normalizedGroupId, router],
	);

	if (!normalizedGroupId) {
		return (
			<div className="h-full flex items-center justify-center gap-2 py-10 text-muted-foreground">
				<Spinner />
				<Typography type="body-sm">그룹 정보를 불러오는 중</Typography>
			</div>
		);
	}

	return (
		<div className="relative">
			<TitleBackHeader title="내 물품 등록" />
			<PostEditor
				mode="create"
				defaultValues={{ title: "", content: "", rentalFee: 0, feeUnit: "HOUR" }}
				isSubmitting={isPending}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
