import { ChevronRightIcon } from "lucide-react";

import { Typography } from "@/shared/components/ui/typography";

import { cn } from "@/shared/lib/utils";

interface GroupSettingsActionRowProps {
	title: string;
	description?: string;
	onClick: () => void;
	danger?: boolean;
}

function GroupSettingsActionRow(props: GroupSettingsActionRowProps) {
	const { title, description, onClick, danger = false } = props;

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full cursor-pointer items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30"
		>
			<div className="min-w-0 flex-1">
				<Typography type="body-sm" className={cn("font-semibold", danger && "text-destructive")}>
					{title}
				</Typography>
				{description ? (
					<Typography type="caption" className="mt-1 truncate-1 text-muted-foreground">
						{description}
					</Typography>
				) : null}
			</div>
			<ChevronRightIcon className="size-6 shrink-0 text-muted-foreground/70" />
		</button>
	);
}

export { GroupSettingsActionRow };
export type { GroupSettingsActionRowProps };
