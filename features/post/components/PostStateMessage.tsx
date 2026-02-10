"use client";

import { Spinner } from "@/shared/components/ui/spinner";
import { Typography, type TypographyType } from "@/shared/components/ui/typography";

interface PostStateMessageProps {
	label: string;
	showSpinner?: boolean;
	fullHeight?: boolean;
	className?: string;
	textType?: TypographyType;
}

function PostStateMessage(props: PostStateMessageProps) {
	const { label, showSpinner = false, fullHeight = false, className, textType = "body-sm" } = props;
	const containerClassName = [
		"flex items-center justify-center py-10 text-muted-foreground",
		showSpinner ? "gap-2" : "",
		fullHeight ? "h-full" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={containerClassName}>
			{showSpinner ? <Spinner /> : null}
			<Typography type={textType}>{label}</Typography>
		</div>
	);
}

export { PostStateMessage };
export type { PostStateMessageProps };
