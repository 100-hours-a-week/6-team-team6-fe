"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface KeywordSubscriptionDeleteDialogProps {
	open: boolean;
	onOpenChange: () => void;
	isDeleting: boolean;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmLabel: string;
	cancelLabel: string;
}

function KeywordSubscriptionDeleteDialog(props: KeywordSubscriptionDeleteDialogProps) {
	const {
		open,
		onOpenChange,
		isDeleting,
		onConfirm,
		title,
		description,
		confirmLabel,
		cancelLabel,
	} = props;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex flex-row justify-end">
					<AlertDialogCancel className="flex-1" disabled={isDeleting}>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						className="flex-1"
						variant="destructive"
						disabled={isDeleting}
						onClick={onConfirm}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export { KeywordSubscriptionDeleteDialog };
export type { KeywordSubscriptionDeleteDialogProps };
