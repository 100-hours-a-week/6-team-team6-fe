import Link from "next/link";

import { ChevronRightIcon } from "lucide-react";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Typography } from "@/shared/components/ui/typography";

import { cn } from "@/shared/lib/utils";

interface MyPageSettingsRowItem {
	id: string;
	title: string;
	description?: string;
	href?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MyPageSettingsRowProps extends MyPageSettingsRowItem {}

function MyPageSettingsRow(props: MyPageSettingsRowProps) {
	const { id, title, description, href } = props;

	const content = (
		<HorizontalPaddingBox className="flex flex-1 items-center justify-between">
			<div>
				<Typography type="subtitle">{title}</Typography>
				{description ? (
					<Typography type="caption" className="mt-1 block truncate-1 text-muted-foreground">
						{description}
					</Typography>
				) : null}
			</div>
			<ChevronRightIcon className={cn("size-5 shrink-0")} />
		</HorizontalPaddingBox>
	);

	if (href) {
		return (
			<Link
				href={href}
				className="flex w-full items-center gap-3  py-4 text-left transition-colors hover:bg-muted/30"
			>
				{content}
			</Link>
		);
	}

	return (
		<button
			type="button"
			disabled
			className="flex w-full cursor-not-allowed items-center gap-3  py-4 text-left"
		>
			{content}
		</button>
	);
}

export { MyPageSettingsRow };
export type { MyPageSettingsRowItem, MyPageSettingsRowProps };
