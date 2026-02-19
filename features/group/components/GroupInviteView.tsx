import Image from "next/image";

import { ImageIcon, XIcon } from "lucide-react";
import type { KeyboardEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
	GROUP_INVITE_LABELS,
	GROUP_INVITE_NICKNAME_MAX_LENGTH,
} from "@/features/group/lib/groupInvite";
import type { GroupInvitationJoinFormValues } from "@/features/group/schemas";

import { Button } from "@/shared/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Input } from "@/shared/components/ui/input";
import { Typography } from "@/shared/components/ui/typography";

import { normalizeImageSrcForNextImage } from "@/shared/lib/image-src";

interface GroupInviteViewProps {
	form: UseFormReturn<GroupInvitationJoinFormValues>;
	groupCoverImageUrl: string | null;
	groupName: string;
	isJoining: boolean;
	onClose: () => void;
	onNicknameKeyDown: KeyboardEventHandler<HTMLInputElement>;
	onSubmit: (values: GroupInvitationJoinFormValues) => void;
}

function GroupInviteView(props: GroupInviteViewProps) {
	const {
		form,
		groupCoverImageUrl,
		groupName,
		isJoining,
		onClose,
		onNicknameKeyDown,
		onSubmit,
	} = props;
	const normalizedCoverImageUrl = normalizeImageSrcForNextImage(groupCoverImageUrl);
	const { control, handleSubmit } = form;

	return (
		<div className="flex flex-1 flex-col bg-card">
			<header className="flex h-11 items-center border-b border-border px-2">
				<IconButton
					size="icon-sm"
					onClick={onClose}
					aria-label={GROUP_INVITE_LABELS.closeAriaLabel}
					icon={<XIcon className="size-6" />}
				/>
			</header>

			<section className="flex flex-1 flex-col items-center px-8 pt-14">
				<div className="relative mb-8 flex size-30 items-center justify-center overflow-hidden rounded-full bg-muted">
					{normalizedCoverImageUrl ? (
						<Image
							src={normalizedCoverImageUrl}
							alt={groupName}
							fill
							sizes="120px"
							priority
							className="object-cover"
						/>
					) : (
						<ImageIcon className="size-12 text-muted-foreground/80" />
					)}
				</div>

				<Typography type="title" className="whitespace-normal break-all text-center leading-tight">
					{groupName}
				</Typography>
				<Typography type="caption" className="mt-2 text-center">
					{GROUP_INVITE_LABELS.invitationDescription}
				</Typography>

				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="mt-7 w-full max-w-xs">
						<FormField
							control={control}
							name="nickname"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel>{GROUP_INVITE_LABELS.nicknameLabel}</FormLabel>
									<FormControl>
										<Input
											{...field}
											maxLength={GROUP_INVITE_NICKNAME_MAX_LENGTH}
											onKeyDown={onNicknameKeyDown}
											placeholder={GROUP_INVITE_LABELS.nicknamePlaceholder}
											className="h-12 rounded-xl px-4 text-base"
										/>
									</FormControl>
									<FormMessage className="text-xs leading-snug" />
								</FormItem>
							)}
						/>

						<Button size="xl" type="submit" className="mt-6 w-full" disabled={isJoining}>
							{GROUP_INVITE_LABELS.enterButton}
						</Button>
					</form>
				</Form>
			</section>
		</div>
	);
}

export { GroupInviteView };
export type { GroupInviteViewProps };
