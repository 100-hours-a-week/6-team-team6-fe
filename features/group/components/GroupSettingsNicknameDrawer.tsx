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
import { InputField } from "@/shared/components/ui/input-field";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { cn } from "@/shared/lib/utils";

interface GroupSettingsNicknameDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	nicknameInput: string;
	nicknameError: string | null;
	isSubmitDisabled: boolean;
	isSubmitting: boolean;
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
		isSubmitting,
		onNicknameInputChange,
		onSubmit,
	} = props;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="pb-2">
					<DrawerTitle className="text-center">
						{GROUP_SETTINGS_LABELS.nicknameSheetTitle}
					</DrawerTitle>
				</DrawerHeader>
				<div className="px-4 pb-1">
					<label htmlFor="group-nickname" className="text-xs text-muted-foreground">
						{GROUP_SETTINGS_LABELS.nicknameInputLabel}
					</label>
					<InputField
						id="group-nickname"
						value={nicknameInput}
						onChange={(event) => onNicknameInputChange(event.target.value)}
						clearable
						maxLength={GROUP_SETTINGS_NICKNAME_MAX_LENGTH}
						groupClassName="mt-1"
						disabled={isSubmitting}
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
						{isSubmitting ? <Spinner /> : "변경하기"}
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
