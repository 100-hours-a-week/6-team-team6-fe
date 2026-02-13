import { CopyIcon } from "lucide-react";

import { GROUP_SETTINGS_LABELS } from "@/features/group/lib/groupSettings";

import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Typography } from "@/shared/components/ui/typography";

interface GroupSettingsInviteDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	inviteLink: string;
	isInviteLinkLoading: boolean;
	onCopyInviteLink: () => Promise<void>;
}

function GroupSettingsInviteDrawer(props: GroupSettingsInviteDrawerProps) {
	const { open, onOpenChange, inviteLink, isInviteLinkLoading, onCopyInviteLink } = props;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="pb-2">
					<DrawerTitle className="text-center">
						{GROUP_SETTINGS_LABELS.inviteSheetTitle}
					</DrawerTitle>
				</DrawerHeader>
				<div className="px-4 pb-2">
					<div className="mt-2 flex items-center gap-1 px-2 py-1.5">
						<Typography type="caption" className="flex-1 text-muted-foreground">
							{inviteLink || GROUP_SETTINGS_LABELS.inviteLinkLoading}
						</Typography>
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							onClick={onCopyInviteLink}
							aria-label="코드 복사"
							disabled={isInviteLinkLoading}
						>
							<CopyIcon className="size-4" />
						</Button>
					</div>
				</div>
				<DrawerFooter className="pt-3">
					<DrawerClose asChild>
						<Button size="xl" variant="outline">
							닫기
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export { GroupSettingsInviteDrawer };
export type { GroupSettingsInviteDrawerProps };
