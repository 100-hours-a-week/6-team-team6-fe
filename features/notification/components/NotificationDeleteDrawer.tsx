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
					<DrawerTitle className="text-center">알림을 삭제하시겠습니까?</DrawerTitle>
					<DrawerDescription className="pt-2 text-center text-xs leading-5">
						삭제한 알림은 다시 복구할 수 없어요.
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="pt-3">
					<Button size="xl" variant="destructive" onClick={onDelete} disabled={isDeleting}>
						삭제
					</Button>
					<DrawerClose asChild>
						<Button size="xl" variant="outline" disabled={isDeleting}>
							취소
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export { NotificationDeleteDrawer };
export type { NotificationDeleteDrawerProps };
