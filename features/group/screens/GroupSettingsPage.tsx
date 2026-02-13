"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { ChevronRightIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { DEFAULT_GROUP_COVER_IMAGES } from "@/features/group/lib/constants";
import { groupRoutes } from "@/features/group/lib/groupRoutes";

import GroupNavigation from "@/shared/components/layout/bottomNavigations/GroupNavigation";
import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
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
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

import { cn } from "@/shared/lib/utils";

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 12;
const GROUP_DETAIL_MEMBER_COUNT = 128;
const GROUP_DETAIL_IMAGE_POOL = DEFAULT_GROUP_COVER_IMAGES.slice(3);

const GROUP_DETAIL_LABELS = {
	title: "그룹 설정",
	groupName: "카카오테크 부트캠프 플로렌스 6조 계속 계쏙계쏙",
	profileGuide: "이 그룹에서 사용할 이름을 설정해요",
	inviteGuide: "초대 링크 또는 코드로 친구를 초대해요",
	leaveGuide: "이 그룹에서 탈퇴해요",
	leaveWarning: "그룹을 나가면 대여 중인 물품 정보와 거래 내역에 접근할 수 없게 됩니다.",
	nicknameLengthGuide: "2~12자 이내 작성",
	nicknameLengthError: "닉네임은 2~12자 이내로 작성 가능합니다.",
	nicknameDuplicatedError: "중복된 닉네임입니다.",
	inviteCopiedToast: "복사되었습니다",
	inviteCopyFailedToast: "복사에 실패했습니다. 다시 시도해주세요.",
	nicknameUpdatedToast: "변경되었습니다.",
	leaveCompletedToast: "그룹을 나갔습니다.",
	inviteLimit: "초대 제한: 제한하지 않음",
} as const;

const duplicatedNicknameSet = new Set(["관리자", "운영진", "성호"]);

const hashString = (value: string) =>
	Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);

const getGroupCoverImageByGroupId = (groupId: string) => {
	if (GROUP_DETAIL_IMAGE_POOL.length === 0) {
		return DEFAULT_GROUP_COVER_IMAGES[0];
	}

	const hashValue = hashString(groupId);
	const imageIndex = hashValue % GROUP_DETAIL_IMAGE_POOL.length;
	return GROUP_DETAIL_IMAGE_POOL[imageIndex];
};

interface SettingsActionRowProps {
	title: string;
	description?: string;
	onClick: () => void;
	danger?: boolean;
}

function SettingsActionRow(props: SettingsActionRowProps) {
	const { title, description, onClick, danger = false } = props;

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer"
		>
			<div className="min-w-0 flex-1">
				<Typography type="body-sm" className={`font-semibold ${cn(danger && "text-destructive")}`}>
					{title}
				</Typography>
				{description ? (
					<Typography type="caption" className="mt-1 truncate-1 text-muted-foreground">
						{description}
					</Typography>
				) : null}
			</div>
			<ChevronRightIcon className="size-6 shrink-0 text-muted-foreground/70" />
		</button>
	);
}

interface GroupSettingsPageProps {
	groupId: string;
}

export function GroupSettingsPage(props: GroupSettingsPageProps) {
	const { groupId } = props;
	const router = useRouter();

	const [nickname, setNickname] = useState("성훈");
	const [nicknameInput, setNicknameInput] = useState("성훈");
	const [nicknameError, setNicknameError] = useState<string | null>(null);

	const [isNicknameDrawerOpen, setIsNicknameDrawerOpen] = useState(false);
	const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
	const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false);

	const groupCoverImageUrl = useMemo(() => getGroupCoverImageByGroupId(groupId), [groupId]);
	const inviteLink = useMemo(
		() => `https://billage.app/groups/${groupId}/invite?code=groupcode4zfqjhfghjwirvri`,
		[groupId],
	);
	const trimmedNicknameInput = nicknameInput.trim();
	const isNicknameSubmitDisabled =
		trimmedNicknameInput.length === 0 || trimmedNicknameInput === nickname;

	const handleSubmitNickname = () => {
		const nextNickname = nicknameInput.trim();

		if (nextNickname.length < NICKNAME_MIN_LENGTH || nextNickname.length > NICKNAME_MAX_LENGTH) {
			setNicknameError(GROUP_DETAIL_LABELS.nicknameLengthError);
			return;
		}

		if (duplicatedNicknameSet.has(nextNickname) && nextNickname !== nickname) {
			setNicknameError(GROUP_DETAIL_LABELS.nicknameDuplicatedError);
			return;
		}

		setNickname(nextNickname);
		setNicknameInput(nextNickname);
		setNicknameError(null);
		setIsNicknameDrawerOpen(false);
		toast.success(GROUP_DETAIL_LABELS.nicknameUpdatedToast);
	};

	const handleCopyInviteLink = async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			toast.success(GROUP_DETAIL_LABELS.inviteCopiedToast);
		} catch (error) {
			console.error(error);
			toast.error(GROUP_DETAIL_LABELS.inviteCopyFailedToast);
		}
	};

	const handleLeaveGroup = () => {
		setIsLeaveDrawerOpen(false);
		toast.success(GROUP_DETAIL_LABELS.leaveCompletedToast);
		router.push(groupRoutes.list());
	};

	const handleOpenNicknameDrawer = () => {
		setNicknameInput(nickname);
		setNicknameError(null);
		setIsNicknameDrawerOpen(true);
	};

	return (
		<>
			<TitleBackHeader title={GROUP_DETAIL_LABELS.title} />
			<div className="flex flex-1">
				<section className="flex h-full flex-1 flex-col overflow-y-scroll no-scrollbar  pb-(--h-bottom-nav)">
					<div>
						<HorizontalPaddingBox className="flex flex-col items-center  py-5 gap-3 ">
							<div className="relative size-30 shrink-0 overflow-hidden rounded-md ">
								<Image
									src={groupCoverImageUrl}
									alt="그룹 대표 이미지"
									fill
									sizes="120px"
									className="object-cover"
								/>
							</div>
							<div className="min-w-0 flex flex-1 flex-col gap-0.5 items-center">
								<p className="text-sm leading-5 font-semibold whitespace-normal break-all">
									{GROUP_DETAIL_LABELS.groupName}
								</p>
								<Typography type="caption" className="mt-0.5 text-muted-foreground ">
									멤버 {GROUP_DETAIL_MEMBER_COUNT}명
								</Typography>
							</div>
						</HorizontalPaddingBox>

						<Separator className=" data-[orientation=horizontal]:h-1" />
					</div>

					<HorizontalPaddingBox className="flex flex-col  gap-3 py-3">
						<Typography type="caption">내 프로필</Typography>
						<div className="flex flex-1 gap-2">
							<div className="relative size-11 shrink-0 overflow-hidden rounded-full  ">
								<Image src="/default-profile.png" alt="내 프로필 이미지" fill sizes="44px" />
							</div>
							<div className="min-w-0">
								<Typography type="subtitle" className="truncate-1">
									{nickname}
								</Typography>
								<Typography type="caption" className="text-muted-foreground">
									멤버
								</Typography>
							</div>
						</div>
					</HorizontalPaddingBox>

					<Separator className=" data-[orientation=horizontal]:h-1" />

					<HorizontalPaddingBox className="mt-2">
						<SettingsActionRow
							title="닉네임 변경"
							description={GROUP_DETAIL_LABELS.profileGuide}
							onClick={handleOpenNicknameDrawer}
						/>
						<SettingsActionRow
							title="멤버 초대"
							description={GROUP_DETAIL_LABELS.inviteGuide}
							onClick={() => setIsInviteDrawerOpen(true)}
						/>

						<SettingsActionRow
							title="그룹 나가기"
							description={GROUP_DETAIL_LABELS.leaveGuide}
							onClick={() => setIsLeaveDrawerOpen(true)}
							danger
						/>
					</HorizontalPaddingBox>
				</section>
			</div>
			<GroupNavigation groupId={groupId} />

			<Drawer open={isNicknameDrawerOpen} onOpenChange={setIsNicknameDrawerOpen}>
				<DrawerContent>
					<DrawerHeader className="pb-2">
						<DrawerTitle className="text-center">닉네임 변경</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 pb-1">
						<label htmlFor="group-nickname" className="text-xs text-muted-foreground">
							새 닉네임
						</label>
						<Input
							id="group-nickname"
							value={nicknameInput}
							onChange={(event) => {
								setNicknameInput(event.target.value);
								if (nicknameError) {
									setNicknameError(null);
								}
							}}
							maxLength={NICKNAME_MAX_LENGTH}
							className="mt-1"
						/>
						<Typography
							type="caption"
							className={cn("mt-1", nicknameError ? "text-destructive" : "text-muted-foreground")}
						>
							{nicknameError ?? GROUP_DETAIL_LABELS.nicknameLengthGuide}
						</Typography>
					</div>
					<DrawerFooter className="pt-3">
						<Button size="xl" onClick={handleSubmitNickname} disabled={isNicknameSubmitDisabled}>
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

			<Drawer open={isInviteDrawerOpen} onOpenChange={setIsInviteDrawerOpen}>
				<DrawerContent>
					<DrawerHeader className="pb-2">
						<DrawerTitle className="text-center">멤버 초대</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 pb-2">
						<div className="mt-2 flex items-center gap-1   px-2 py-1.5">
							<Typography type="caption" className="truncate-1 flex-1 text-muted-foreground">
								{inviteLink}
							</Typography>
							<Button
								type="button"
								size="icon-sm"
								variant="ghost"
								onClick={handleCopyInviteLink}
								aria-label="코드 복사"
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

			<Drawer open={isLeaveDrawerOpen} onOpenChange={setIsLeaveDrawerOpen}>
				<DrawerContent>
					<DrawerHeader className="pb-2">
						<DrawerTitle className="text-center">그룹을 나가시겠어요?</DrawerTitle>
						<DrawerDescription className="pt-2 text-center text-xs leading-5">
							{GROUP_DETAIL_LABELS.leaveWarning}
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter className="pt-3">
						<Button size="xl" onClick={handleLeaveGroup}>
							나가기
						</Button>
						<DrawerClose asChild>
							<Button size="xl" variant="outline">
								취소
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
