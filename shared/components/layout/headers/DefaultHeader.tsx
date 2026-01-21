import Image from "next/image";
import Link from "next/link";

import { SearchIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { IconButton } from "@/shared/components/ui/icon-button";

import { uiConst } from "@/shared/lib/constants";

// TODO: link
function DefaultHeader() {
	return (
		<HeaderLayout
			left={<BackButton />}
			center={
				<Image
					src="/text-logo.png"
					alt="Logo"
					width={uiConst.WIDTH.HEADER_LOGO}
					height={uiConst.HEIGHT.HEADER_LOGO}
				/>
			}
			right={
				<IconButton asChild>
					{/* TODO: groupId */}
					<Link href={`/groups/1/search`}>
						<SearchIcon />
					</Link>
				</IconButton>
			}
		/>
	);
}

export default DefaultHeader;
