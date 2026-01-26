"use client";

import { PostEditorView } from "@/features/post/components/PostEditorView";
import {
	type AddedImage,
	type CreatePostEditorProps,
	type CreatePostPayload,
	type EditPostEditorProps,
	type EditPostPayload,
	type ExistingImage,
	type FeeUnit,
	type PostEditorImageState,
	type PostEditorValues,
	type RentalItemPostEditorProps,
	usePostEditor,
} from "@/features/post/hooks/usePostEditor";

function PostEditor(props: RentalItemPostEditorProps) {
	const editorState = usePostEditor(props);

	return <PostEditorView {...editorState} mode={props.mode} onCancel={props.onCancel} />;
}

export default PostEditor;
export type {
	AddedImage,
	CreatePostEditorProps,
	CreatePostPayload,
	EditPostEditorProps,
	EditPostPayload,
	ExistingImage,
	FeeUnit,
	PostEditorImageState,
	PostEditorValues,
	RentalItemPostEditorProps,
};
