import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
			<div className="flex max-w-sm flex-col items-center gap-3">
				<span className="text-6xl font-semibold tracking-tight text-foreground/80">404</span>
				<Typography type="title">페이지를 찾을 수 없어요</Typography>
				<Typography type="body-sm" className="text-muted-foreground">
					요청하신 페이지가 삭제되었거나 주소가 변경됐을 수 있어요.
				</Typography>
			</div>
			<div className="flex w-full max-w-xs flex-col gap-2">
				<Button asChild size="lg" className="w-full">
					<Link href="/">홈으로 이동</Link>
				</Button>
			</div>
		</div>
	);
}

export default NotFound;
