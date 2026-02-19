import Link from "next/link";

import { Plus } from "lucide-react";

import { postRoutes } from "@/features/post/lib/postRoutes";

import GroupNavigation from "@/shared/components/layout/bottomNavigations/GroupNavigation";
import DefaultHeader from "@/shared/components/layout/headers/DefaultHeader";
import { IconButton } from "@/shared/components/ui/icon-button";

interface GroupLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		groupId: string;
	}>;
}

async function GroupLayout({ children, params }: GroupLayoutProps) {
	const { groupId } = await params;

	return (
		<>
			<DefaultHeader />
			<div className="flex flex-1">
				<section
					className={`flex flex-1 flex-col h-full overflow-y-scroll no-scrollbar 
						pb-(--h-bottom-nav)
 `}
				>
					{children}
				</section>
			</div>

			<div className="fixed bottom-20 right-6 w-10 h-10 bg-black rounded-full flex items-center justify-center">
				<IconButton asChild aria-label="글 작성">
					<Link href={postRoutes.postCreate(groupId)}>
						<Plus color="white" />
					</Link>
				</IconButton>
			</div>
			<GroupNavigation groupId={groupId} />
		</>
	);
}

export default GroupLayout;
