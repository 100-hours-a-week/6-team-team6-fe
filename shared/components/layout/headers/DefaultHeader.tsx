import Image from "next/image";

import { ArrowLeftIcon, SearchIcon } from "lucide-react";

import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { IconButton } from "@/shared/components/ui/icon-button";

import { uiConst } from "@/shared/lib/constants";

// TODO: link
function DefaultHeader() {
	return (
		<HeaderLayout>
			<IconButton icon={<ArrowLeftIcon />} />
			<div className="m-auto">
				<Image
					src="/text-logo.png"
					alt="Logo"
					width={uiConst.WIDTH.HEADER_LOGO}
					height={uiConst.HEIGHT.HEADER_LOGO}
				/>
			</div>
			<IconButton icon={<SearchIcon />} />
		</HeaderLayout>
	);
}

export default DefaultHeader;
