import PostEditor from "@/features/post/components/PostEditor";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

import { submitPost } from "@/app/(main)/groups/[groupId]/(fullscreen)/posts/create/actions";

async function PostCreatePage() {
	return (
		<div className="relative">
			<TitleBackHeader title="내 물품 수정" />
			<PostEditor
				mode="create"
				defaultValues={{ title: "", content: "", rentalFee: 0, feeUnit: "HOUR" }}
				onSubmit={submitPost}
			/>
		</div>
	);
}
export default PostCreatePage;
