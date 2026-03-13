import Link from "next/link";

import { BellIcon } from "lucide-react";

import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import HeaderLogo from "@/shared/components/layout/headers/HeaderLogo";
import { IconButton } from "@/shared/components/ui/icon-button";

function LogoNotificationHeader() {
	return (
		<HeaderLayout
			left={<div className="h-11 w-11" />}
			center={<HeaderLogo />}
			right={
				<IconButton size="icon-touch" asChild aria-label="알림 페이지로 이동">
					<Link href="/notifications">
						<BellIcon className="size-5" />
					</Link>
				</IconButton>
			}
		/>
	);
}

export default LogoNotificationHeader;
