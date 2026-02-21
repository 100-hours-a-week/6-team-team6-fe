import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import HeaderLogo from "@/shared/components/layout/headers/HeaderLogo";

function LogoBackHeader() {
	return (
		<HeaderLayout
			left={<BackButton />}
			center={<HeaderLogo />}
			right={<div className="w-8 h-8"></div>}
		/>
	);
}

export default LogoBackHeader;
