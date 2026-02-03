import Image from "next/image";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";

function LogoBackHeader() {
	return (
		<HeaderLayout
			left={<BackButton />}
			center={<Image src="/text-logo.png" alt="Logo" loading="eager" width={70} height={21} />}
			right={<div className="w-8 h-8"></div>}
		/>
	);
}

export default LogoBackHeader;
