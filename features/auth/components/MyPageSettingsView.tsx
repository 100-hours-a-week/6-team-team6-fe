"use client";

import { useState } from "react";

import { MyPageSettingsRow } from "@/features/auth/components/MyPageSettingsRow";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Typography } from "@/shared/components/ui/typography";

interface MyPageSettingsViewProps {
	loginId?: string;
	avatarImageUrl?: string;
	isProfileLoading: boolean;
	onLogout: () => Promise<void>;
}

function MyPageSettingsView(props: MyPageSettingsViewProps) {
	const { loginId, avatarImageUrl, isProfileLoading, onLogout } = props;
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		if (isLoggingOut) {
			return;
		}

		setIsLoggingOut(true);
		try {
			await onLogout();
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="min-h-0 flex flex-1 flex-col justify-between overflow-y-auto pb-(--h-bottom-nav) no-scrollbar">
			<div>
				<HorizontalPaddingBox className="py-2 ">
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-3">
							{isProfileLoading ? (
								<Skeleton className="size-16 rounded-full" />
							) : (
								<Avatar size="xl">
									<AvatarImage src={avatarImageUrl} />
									<AvatarFallback></AvatarFallback>
								</Avatar>
							)}
							<div className="min-w-0 flex-1">
								{isProfileLoading ? (
									<div className="flex flex-col gap-2">
										<Skeleton className="h-5 w-36" />
										<Skeleton className="h-4 w-24" />
									</div>
								) : (
									<>
										<Typography type="subtitle" className="truncate-1">
											{loginId ?? "-"}
										</Typography>
									</>
								)}
							</div>
						</div>
					</div>
				</HorizontalPaddingBox>

				<Separator />

				<MyPageSettingsRow id="notifications" title="알림 설정" href="/mypage/notifications" />
			</div>

			<HorizontalPaddingBox className="mb-2 ">
				<Button
					variant="link"
					className="font-normal"
					disabled={isLoggingOut}
					onClick={() => void handleLogout()}
				>
					로그아웃
				</Button>
			</HorizontalPaddingBox>
		</div>
	);
}

export { MyPageSettingsView };
export type { MyPageSettingsViewProps };
