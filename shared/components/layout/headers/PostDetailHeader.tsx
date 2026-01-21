"use client";

import Image from "next/image";

import { EllipsisVerticalIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { IconButton } from "@/shared/components/ui/icon-button";

import { uiConst } from "@/shared/lib/constants";

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
				isSeller ? <IconButton icon={<EllipsisVerticalIcon />} onClick={onClickMore} /> : <></>
			}
		/>
	);
}

export default PostDetailHeader;
