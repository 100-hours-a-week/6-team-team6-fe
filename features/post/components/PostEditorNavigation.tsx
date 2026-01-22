import NavigationLayout from "@/shared/components/layout/bottomNavigations/NavigationLayout";
import { Button } from "@/shared/components/ui/button";
import { Typography } from "@/shared/components/ui/typography";

interface PostEditorNavigationProps {
	mode: "create" | "edit";
	onClick: () => void;
}

function PostEditorNavigation(props: PostEditorNavigationProps) {
	const { mode } = props;

	return (
		<NavigationLayout>
			<div className="h-11 w-full">
				<div className="h-full flex items-center">
					<Button type="submit" size={"lg"} className="w-full h-full">
						<Typography type={"subtitle"} className="text-white w-29">
							{mode === "create" ? "작성하기" : "수정하기"}
						</Typography>
					</Button>
				</div>
			</div>
		</NavigationLayout>
	);
}

export default PostEditorNavigation;
