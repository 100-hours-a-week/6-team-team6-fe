import { notificationMessages } from "@/features/notification/lib/constants";

import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";

interface NotificationDeleteDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isDeleting: boolean;
	onDelete: () => Promise<void>;
}

function NotificationDeleteDrawer(props: NotificationDeleteDrawerProps) {
	const { open, onOpenChange, isDeleting, onDelete } = props;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="pb-2">
					<DrawerTitle className="text-center">
						{notificationMessages.deleteDrawerTitle}
					</DrawerTitle>
					<DrawerDescription className="pt-2 text-center text-xs leading-5">
						{notificationMessages.deleteDrawerDescription}
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="pt-3">
					<Button size="xl" variant="destructive" onClick={onDelete} disabled={isDeleting}>
						{notificationMessages.deleteAction}
					</Button>
					<DrawerClose asChild>
						<Button size="xl" variant="outline" disabled={isDeleting}>
							{notificationMessages.cancelAction}
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export { NotificationDeleteDrawer };
export type { NotificationDeleteDrawerProps };
