"use client";

import { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createChatroom,
	type CreateChatroomError,
} from "@/features/chat/api/createChatroom";

import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

import { getApiErrorMessage } from "@/shared/lib/error-message-map";

interface PostDetailNavigationProps {
	isSeller: boolean;
	activeChatroomCount: number | null;
	chatroomId: number | null;
	postId: number;
}

function PostDetailNavigation(props: PostDetailNavigationProps) {
	const { isSeller, activeChatroomCount, chatroomId, postId } = props;
	const router = useRouter();
	const normalizedCount = activeChatroomCount ?? 0;
	const hasActiveChats = normalizedCount > 0;

	const { mutate: createRoom, isPending: isCreating } = useMutation<
		Awaited<ReturnType<typeof createChatroom>>,
		CreateChatroomError,
		void
	>({
		mutationFn: () => createChatroom({ postId }),
		onSuccess: (data) => {
			router.push(`/chat/${data.chatroomId}`);
		},
		onError: (error) => {
			const message = getApiErrorMessage(error?.code) ?? "채팅방 생성에 실패했습니다.";
			toast.error(message);
		},
	});

	const buttonLabel = useMemo(() => {
		if (isSeller) {
			return `진행중인 채팅 ${normalizedCount}`;
		}
		return "채팅하기";
	}, [isSeller, normalizedCount]);

	const handleClick = useCallback(() => {
		if (isSeller) {
			if (!hasActiveChats) {
				return;
			}
			router.push(`/chat?type=item&postId=${postId}`);
			return;
		}

		if (chatroomId && chatroomId > 0) {
			router.push(`/chat/${chatroomId}`);
			return;
		}

		createRoom();
	}, [chatroomId, createRoom, hasActiveChats, isSeller, postId, router]);

	return (
		<NavigationLayout>
			<div className="h-11 w-full">
				<div className="h-full flex items-center justify-end">
					<Button
						size="lg"
						className="h-full"
						onClick={handleClick}
						disabled={(isSeller && !hasActiveChats) || (!isSeller && isCreating)}
					>
						<Typography type="subtitle" className="text-white w-29">
							{buttonLabel}
						</Typography>
					</Button>
				</div>
			</div>
		</NavigationLayout>
	);
}

export default PostDetailNavigation;
