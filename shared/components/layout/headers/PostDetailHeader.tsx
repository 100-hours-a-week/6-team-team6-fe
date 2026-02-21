"use client";

import { EllipsisVerticalIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { IconButton } from "@/shared/components/ui/icon-button";

interface PostDetailHeaderProps {
	onClickMore: () => void;
	isSeller: boolean;
}

function PostDetailHeader(props: PostDetailHeaderProps) {
	const { onClickMore, isSeller } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={undefined}
			right={
				isSeller ? (
					<IconButton
						icon={<EllipsisVerticalIcon />}
						size="icon-touch"
						onClick={onClickMore}
						aria-label="게시글 더보기"
					/>
				) : (
					<></>
				)
			}
		/>
	);
}

export default PostDetailHeader;
