import { submitPost } from "@/features/post/api/editPost";
import PostEditor from "@/features/post/components/PostEditor";
import { DUMMY_POSTS } from "@/features/post/constants";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface PostEditPageProps {
	params: Promise<{ postId: string }>;
}

async function PostEditPage(props: PostEditPageProps) {
	const { postId } = await props.params;

	const postIdNumber = Number(postId);
	const post = DUMMY_POSTS.find((item) => item.postId === postIdNumber);

	if (!post) {
		return null; // Or render a 404 page
	}

	return (
		<div className="relative">
			<TitleBackHeader title="내 물품 수정" />
			<PostEditor
				mode="edit"
				postId={postId}
				initialValues={{ ...post, images: [] }}
				// TODO:fix
				onSubmit={submitPost}
			/>
		</div>
	);
}
export default PostEditPage;
