"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

const NO_PERMISSION_MESSAGE = "권한이 없습니다.";
const FALLBACK_REDIRECT_PATH = "/";
// TODO: Redirect to group list page once the target route is finalized.

function PostDetailForbiddenRedirect() {
	const router = useRouter();
	const hasHandledRef = useRef(false);

	useEffect(() => {
		if (hasHandledRef.current) {
			return;
		}
		hasHandledRef.current = true;

		window.alert(NO_PERMISSION_MESSAGE);
		router.replace(FALLBACK_REDIRECT_PATH);
	}, [router]);

	return null;
}

export { PostDetailForbiddenRedirect };
