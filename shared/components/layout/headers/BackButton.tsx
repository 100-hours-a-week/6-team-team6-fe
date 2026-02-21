"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "lucide-react";

import { IconButton } from "@/shared/components/ui/icon-button";

type BackButtonProps = {
	fallbackHref?: string;
};

export function BackButton({ fallbackHref = "/groups" }: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push(fallbackHref);
		}
	};

	return (
		<IconButton
			icon={<ArrowLeftIcon />}
			size="icon-touch"
			onClick={handleClick}
			aria-label="뒤로가기"
		/>
	);
}
