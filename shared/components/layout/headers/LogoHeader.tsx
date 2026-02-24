import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import HeaderLogo from "@/shared/components/layout/headers/HeaderLogo";

function LogoHeader() {
	return <HeaderLayout left={<></>} center={<HeaderLogo />} right={<></>} />;
}

export default LogoHeader;
