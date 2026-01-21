import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

function MyPage() {
	return (
		<div className="flex flex-1 flex-col gap-y-4 items-center h-full">
			<Avatar className="h-24 w-24 border-0">
				<AvatarImage src="/default-profile.png" />
				<AvatarFallback></AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-y-2 justify-start">
				<span className="text-sm text-muted-foreground">아이디</span>

				<p className="text-xl font-medium text-foreground">test-id-123</p>
			</div>
			<div>
				<Button>로그아웃</Button>
			</div>
		</div>
	);
}

export default MyPage;
