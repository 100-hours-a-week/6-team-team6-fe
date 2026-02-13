import {
	GROUP_SETTINGS_LABELS,
	GROUP_SETTINGS_NICKNAME_MAX_LENGTH,
} from "@/features/group/lib/groupSettings";

import { Button } from "@/shared/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Typography } from "@/shared/components/ui/typography";

import { cn } from "@/shared/lib/utils";

interface GroupSettingsNicknameDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	nicknameInput: string;
	nicknameError: string | null;
	isSubmitDisabled: boolean;
	onNicknameInputChange: (nextValue: string) => void;
	onSubmit: () => void;
}

function GroupSettingsNicknameDrawer(props: GroupSettingsNicknameDrawerProps) {
	const {
		open,
		onOpenChange,
		nicknameInput,
		nicknameError,
		isSubmitDisabled,
		onNicknameInputChange,
		onSubmit,
	} = props;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="pb-2">
					<DrawerTitle className="text-center">{GROUP_SETTINGS_LABELS.nicknameSheetTitle}</DrawerTitle>
				</DrawerHeader>
				<div className="px-4 pb-1">
					<label htmlFor="group-nickname" className="text-xs text-muted-foreground">
						{GROUP_SETTINGS_LABELS.nicknameInputLabel}
					</label>
					<Input
						id="group-nickname"
						value={nicknameInput}
						onChange={(event) => onNicknameInputChange(event.target.value)}
						maxLength={GROUP_SETTINGS_NICKNAME_MAX_LENGTH}
						className="mt-1"
					/>
					<Typography
						type="caption"
						className={cn("mt-1", nicknameError ? "text-destructive" : "text-muted-foreground")}
					>
						{nicknameError ?? GROUP_SETTINGS_LABELS.nicknameLengthGuide}
					</Typography>
				</div>
				<DrawerFooter className="pt-3">
					<Button size="xl" onClick={onSubmit} disabled={isSubmitDisabled}>
						변경하기
					</Button>
					<DrawerClose asChild>
						<Button size="xl" variant="outline">
							취소
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export { GroupSettingsNicknameDrawer };
export type { GroupSettingsNicknameDrawerProps };
