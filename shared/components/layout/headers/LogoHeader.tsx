import Image from "next/image";

import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";

function LogoHeader() {
	return (
		<HeaderLayout>
			<div className="m-auto">
				<Image src="/text-logo.png" alt="Logo" width={70} height={21} />
			</div>
		</HeaderLayout>
	);
}

export default LogoHeader;
