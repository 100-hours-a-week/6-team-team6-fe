import Image from "next/image";
import Link from "next/link";

import { routeConst, uiConst } from "@/shared/lib/constants";

function HeaderLogo() {
	return (
		<Link href={routeConst.DEFAULT_AUTH_REDIRECT_PATH} aria-label="그룹 목록으로 이동">
			<Image
				src="/text-logo.png"
				alt="Logo"
				width={uiConst.WIDTH.HEADER_LOGO}
				height={uiConst.HEIGHT.HEADER_LOGO}
				loading="eager"
			/>
		</Link>
	);
}

export default HeaderLogo;
