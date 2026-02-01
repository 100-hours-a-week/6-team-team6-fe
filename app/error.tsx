"use client";

import { useEffect } from "react";

import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

function Error(props: ErrorProps) {
	const { error, reset } = props;

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
			<div className="flex max-w-sm flex-col items-center gap-3">
				<span className="text-6xl font-semibold tracking-tight text-foreground/80">500</span>
				<Typography type="title">일시적인 오류가 발생했어요</Typography>
				<Typography type="body-sm" className="text-muted-foreground">
					잠시 후 다시 시도해 주세요. 문제가 계속되면 다시 로그인해 주세요.
				</Typography>
			</div>
			<div className="flex w-full max-w-xs flex-col gap-2">
				<Button size="lg" className="w-full" type="button" onClick={reset}>
					다시 시도
				</Button>
				<Button asChild size="lg" variant="outline" className="w-full">
					<Link href="/">홈으로 이동</Link>
				</Button>
			</div>
		</div>
	);
}

export default Error;
