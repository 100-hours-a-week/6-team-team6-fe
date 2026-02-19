"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

const NO_PERMISSION_MESSAGE = "권한이 없습니다.";
const FALLBACK_REDIRECT_PATH = "/groups";

function PostDetailForbiddenRedirect() {
	const router = useRouter();
	const hasHandledRef = useRef(false);

	useEffect(() => {
		if (hasHandledRef.current) {
			return;
		}
		hasHandledRef.current = true;

		toast.error(NO_PERMISSION_MESSAGE);
		router.replace(FALLBACK_REDIRECT_PATH);
	}, [router]);

	return null;
}

export { PostDetailForbiddenRedirect };
