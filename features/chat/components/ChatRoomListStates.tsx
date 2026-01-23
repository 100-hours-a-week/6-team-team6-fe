import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

type ChatRoomListStateProps = {
	label: string;
};

export function ChatRoomListLoading({ label }: ChatRoomListStateProps) {
	return (
		<div className="flex items-center gap-2 text-muted-foreground">
			<Spinner />
			<Typography type="body-sm">{label}</Typography>
		</div>
	);
}

export function ChatRoomListError({ label }: ChatRoomListStateProps) {
	return (
		<Typography type="body-sm" className="text-destructive">
			{label}
		</Typography>
	);
}

export function ChatRoomListEmpty({ label }: ChatRoomListStateProps) {
	return (
		<Typography type="body-sm" className="text-muted-foreground">
			{label}
		</Typography>
	);
}
