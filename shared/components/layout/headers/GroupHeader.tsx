import Link from "next/link";

import { SearchIcon } from "lucide-react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import HeaderLogo from "@/shared/components/layout/headers/HeaderLogo";
import { IconButton } from "@/shared/components/ui/icon-button";

interface GroupHeaderProps {
	groupId: string;
}

function GroupHeader(props: GroupHeaderProps) {
	const { groupId } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={<HeaderLogo />}
			right={
				<IconButton asChild>
					<Link href={`/groups/${groupId}/search`}>
						<SearchIcon />
					</Link>
				</IconButton>
			}
		/>
	);
}

export default GroupHeader;
