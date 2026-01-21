"use client";

import Image from "next/image";

import { EllipsisVerticalIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { IconButton } from "@/shared/components/ui/icon-button";

import { uiConst } from "@/shared/lib/constants";

interface PostDetailHeaderProps {
	onClickMore: () => void;
}

function PostDetailHeader(props: PostDetailHeaderProps) {
	const { onClickMore } = props;

	return (
		<HeaderLayout>
			<BackButton />
			<div className="m-auto">
				<Image
					src="/text-logo.png"
					alt="Logo"
					width={uiConst.WIDTH.HEADER_LOGO}
					height={uiConst.HEIGHT.HEADER_LOGO}
				/>
			</div>
			<IconButton icon={<EllipsisVerticalIcon />} onClick={onClickMore} />
		</HeaderLayout>
	);
}

export default PostDetailHeader;
