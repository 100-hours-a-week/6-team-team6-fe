import Image from "next/image";

import {
	GroupSettingsActionRow,
	type GroupSettingsActionRowProps,
} from "@/features/group/components/GroupSettingsActionRow";
import { GroupSettingsInviteDrawer } from "@/features/group/components/GroupSettingsInviteDrawer";
import { GroupSettingsLeaveDrawer } from "@/features/group/components/GroupSettingsLeaveDrawer";
import { GroupSettingsNicknameDrawer } from "@/features/group/components/GroupSettingsNicknameDrawer";
import type {
	GroupSettingsActions,
	GroupSettingsState,
} from "@/features/group/hooks/useGroupSettings";
import { GROUP_SETTINGS_LABELS } from "@/features/group/lib/groupSettings";

import GroupNavigation from "@/shared/components/layout/bottomNavigations/GroupNavigation";
import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

interface GroupSettingsViewProps {
	groupId: string;
	state: GroupSettingsState;
	actions: GroupSettingsActions;
}

function GroupSettingsView(props: GroupSettingsViewProps) {
	const { groupId, state, actions } = props;
	const settingRows: GroupSettingsActionRowProps[] = [
		{
			title: "닉네임 변경",
			description: GROUP_SETTINGS_LABELS.profileGuide,
			onClick: actions.openNicknameDrawer,
		},
		{
			title: "멤버 초대",
			description: GROUP_SETTINGS_LABELS.inviteGuide,
			onClick: actions.openInviteDrawer,
		},
		{
			title: "그룹 나가기",
			description: GROUP_SETTINGS_LABELS.leaveGuide,
			onClick: actions.openLeaveDrawer,
			danger: true,
		},
	];

	return (
		<>
			<TitleBackHeader title={GROUP_SETTINGS_LABELS.title} />
			<div className="flex flex-1">
				<section className="flex h-full flex-1 flex-col overflow-y-scroll pb-(--h-bottom-nav) no-scrollbar">
					<div>
						<HorizontalPaddingBox className="flex flex-col items-center gap-3 py-5">
							<div className="relative size-30 shrink-0 overflow-hidden rounded-md">
								<Image
									src={state.groupCoverImageUrl}
									alt="그룹 대표 이미지"
									fill
									sizes="120px"
									className="object-cover"
								/>
							</div>
							<div className="min-w-0 flex flex-1 flex-col items-center gap-0.5">
								<p className="text-sm leading-5 font-semibold whitespace-normal break-all">
									{state.isGroupLoading ? "-" : state.groupName}
								</p>
							</div>
						</HorizontalPaddingBox>
						<Separator className="data-[orientation=horizontal]:h-1" />
					</div>

					<HorizontalPaddingBox className="flex flex-col gap-3 py-3">
						<Typography type="caption">{GROUP_SETTINGS_LABELS.profileTitle}</Typography>
						<div className="flex flex-1 gap-2">
							<div className="relative size-11 shrink-0 overflow-hidden rounded-full">
								<Image src="/default-profile.png" alt="내 프로필 이미지" fill sizes="44px" />
							</div>
							<div className="min-w-0">
								<Typography type="subtitle" className="truncate-1">
									{state.isMembershipLoading ? "-" : state.nickname}
								</Typography>
								<Typography type="caption" className="text-muted-foreground">
									{GROUP_SETTINGS_LABELS.memberRole}
								</Typography>
							</div>
						</div>
					</HorizontalPaddingBox>

					<Separator className="data-[orientation=horizontal]:h-1" />

					<HorizontalPaddingBox className="mt-2">
						{settingRows.map((row) => (
							<GroupSettingsActionRow key={row.title} {...row} />
						))}
					</HorizontalPaddingBox>
				</section>
			</div>
			<GroupNavigation groupId={groupId} />

			<GroupSettingsNicknameDrawer
				open={state.isNicknameDrawerOpen}
				onOpenChange={actions.setNicknameDrawerOpen}
				nicknameInput={state.nicknameInput}
				nicknameError={state.nicknameError}
				isSubmitDisabled={state.isNicknameSubmitDisabled}
				isSubmitting={state.isNicknameSubmitting}
				onNicknameInputChange={actions.changeNicknameInput}
				onSubmit={actions.submitNickname}
			/>

			<GroupSettingsInviteDrawer
				open={state.isInviteDrawerOpen}
				onOpenChange={actions.setInviteDrawerOpen}
				inviteLink={state.inviteLink}
				isInviteLinkLoading={state.isInviteLinkLoading}
				onCopyInviteLink={actions.copyInviteLink}
			/>

			<GroupSettingsLeaveDrawer
				open={state.isLeaveDrawerOpen}
				onOpenChange={actions.setLeaveDrawerOpen}
				isLeavingGroup={state.isLeavingGroup}
				onLeaveGroup={actions.leaveGroup}
			/>
		</>
	);
}

export { GroupSettingsView };
export type { GroupSettingsViewProps };
