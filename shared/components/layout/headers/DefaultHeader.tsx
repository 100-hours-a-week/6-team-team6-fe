import Link from "next/link";

import { SearchIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import HeaderLogo from "@/shared/components/layout/headers/HeaderLogo";
import { IconButton } from "@/shared/components/ui/icon-button";

// TODO: link
function DefaultHeader() {
	return (
		<HeaderLayout
			left={<BackButton />}
			center={<HeaderLogo />}
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
