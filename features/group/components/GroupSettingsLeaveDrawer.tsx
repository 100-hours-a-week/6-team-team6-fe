import { GROUP_SETTINGS_LABELS } from "@/features/group/lib/groupSettings";

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

interface GroupSettingsLeaveDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isLeavingGroup: boolean;
	onLeaveGroup: () => void;
}

function GroupSettingsLeaveDrawer(props: GroupSettingsLeaveDrawerProps) {
	const { open, onOpenChange, isLeavingGroup, onLeaveGroup } = props;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="pb-2">
					<DrawerTitle className="text-center">{GROUP_SETTINGS_LABELS.leaveSheetTitle}</DrawerTitle>
					<DrawerDescription className="pt-2 text-center text-xs leading-5">
						{GROUP_SETTINGS_LABELS.leaveWarning}
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="pt-3">
					<Button size="xl" onClick={onLeaveGroup} disabled={isLeavingGroup}>
						{isLeavingGroup ? "나가는 중..." : "나가기"}
					</Button>
					<DrawerClose asChild>
						<Button size="xl" variant="outline" disabled={isLeavingGroup}>
							취소
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export { GroupSettingsLeaveDrawer };
export type { GroupSettingsLeaveDrawerProps };
