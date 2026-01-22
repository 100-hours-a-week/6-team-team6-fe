import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

interface PostDetailNavigationProps {
	isSeller: boolean;
	activeChatroomCount?: number;
	postId: number;
}

function PostDetailNavigation(props: PostDetailNavigationProps) {
	const { isSeller, activeChatroomCount } = props;

	return (
		<NavigationLayout>
			<div className="h-11 w-full">
				<div className="h-full flex items-center justify-end">
					<Button size={"lg"} className="h-full">
						<Typography type={"subtitle"} className="text-white w-29">
							{isSeller ? `진행중인 채팅 ${activeChatroomCount}` : "채팅하기"}
						</Typography>
					</Button>
				</div>
			</div>
		</NavigationLayout>
	);
}

export default PostDetailNavigation;
