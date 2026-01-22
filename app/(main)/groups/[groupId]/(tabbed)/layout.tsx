import Link from "next/link";

import { Plus } from "lucide-react";

import DefaultNavigation from "@/shared/components/layout/bottomNavigations/DefaultNavigation";
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
						px-(--p-layout-horizontal)
						pb-(--h-bottom-nav)
 `}
				>
					{children}
				</section>
			</div>

			<div className="fixed bottom-20 right-6 w-10 h-10 bg-black rounded-full flex items-center justify-center">
				<IconButton asChild aria-label="글 작성">
					<Link href={`/groups/${groupId}/posts/create`}>
						<Plus color="white" />
					</Link>
				</IconButton>
			</div>
			<DefaultNavigation />
		</>
	);
}

export default GroupLayout;
