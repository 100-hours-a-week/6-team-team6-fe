"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createPostDraft,
	CreatePostDraftError,
	type PostDraftResponse,
} from "@/features/post/api/createPostDraft";
import { type FeeUnit, PostEditorSchema, type PostEditorValues } from "@/features/post/schemas";

import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { postValidationMessages } from "@/shared/lib/error-messages";

export type { FeeUnit };
export type { PostEditorValues };

export interface ExistingImage {
	id: string;
	url: string;
}

const mockExistingImages: ExistingImage[] = [
	{ id: "mock-1", url: "/dummy-post-image.png" },
	{ id: "mock-2", url: "/default-profile.png" },
	{ id: "mock-3", url: "/dummy-post-image.png" },
];

const AI_DRAFT_ERROR_MESSAGE = "AI 자동 작성에 실패했습니다.";
const IMAGE_FETCH_ERROR_CODE = "IMAGE_FETCH_FAILED";

const getFileNameFromUrl = (url: string, fallback: string) => {
	try {
		const parsed = new URL(url, window.location.origin);
		const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();
		return lastSegment ?? fallback;
	} catch {
		return fallback;
	}
};

const withExtension = (fileName: string, mimeType: string) => {
	if (fileName.includes(".")) {
		return fileName;
	}
	const extension = mimeType.split("/")[1];
	if (!extension) {
		return fileName;
	}
	return `${fileName}.${extension}`;
};

const createFileFromUrl = async (url: string, fallbackName: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(IMAGE_FETCH_ERROR_CODE);
	}
	const blob = await response.blob();
	const mimeType = blob.type || "application/octet-stream";
	const fileName = withExtension(getFileNameFromUrl(url, fallbackName), mimeType);
	return new File([blob], fileName, { type: mimeType });
};

export interface AddedImage {
	file: File;
	previewUrl: string;
}

export interface PostEditorImageState {
	existing: ExistingImage[];
	added: AddedImage[];
}

export interface CreatePostEditorProps {
	mode: "create";
	defaultValues?: Partial<PostEditorValues>;
	isSubmitting?: boolean;
	onCancel?: () => void;
	onSubmit: (payload: CreatePostPayload) => void | Promise<void>;
}

export interface CreatePostPayload extends PostEditorValues {
	newImages: File[];
}

export interface EditPostEditorProps {
	mode: "edit";
	postId: string;
	initialValues: PostEditorValues & {
		images: ExistingImage[];
	};
	isSubmitting?: boolean;
	onCancel?: () => void;
	onSubmit: (payload: EditPostPayload) => void | Promise<void>;
}

export interface EditPostPayload extends PostEditorValues {
	postId: string;
	keepImageIds: string[];
	newImages: File[];
}

export type RentalItemPostEditorProps = CreatePostEditorProps | EditPostEditorProps;

export type PostEditorErrors = Partial<Record<keyof PostEditorValues, string>> & {
	images?: string;
};

interface UsePostEditorResult {
	values: PostEditorValues;
	images: PostEditorImageState;
	errors: PostEditorErrors;
	isSubmitting: boolean;
	isGenerating: boolean;
	onChangeField: <Key extends keyof PostEditorValues>(
		key: Key,
		value: PostEditorValues[Key],
	) => void;
	onAddImages: (fileList: FileList | null) => Promise<void>;
	onRemoveExistingImage: (imageId: string) => void;
	onRemoveAddedImage: (index: number) => void;
	onAutoWrite: () => Promise<void>;
	onSubmitForm: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function usePostEditor(props: RentalItemPostEditorProps): UsePostEditorResult {
	const isEdit = props.mode === "edit";
	const isSubmitting = props.isSubmitting ?? false;
	const initialImages = isEdit ? props.initialValues.images : [];
	const mode = props.mode;
	const createSubmit = props.mode === "create" ? props.onSubmit : null;
	const editSubmit = props.mode === "edit" ? props.onSubmit : null;
	const postId = isEdit ? props.postId : undefined;
	const useMockExistingImages =
		process.env.NODE_ENV === "development" && isEdit && initialImages.length === 0;

	const [values, setValues] = useState<PostEditorValues>(() => {
		if (props.mode === "edit") {
			const { title, content, rentalFee, feeUnit } = props.initialValues;
			return { title, content, rentalFee, feeUnit };
		}
		return {
			title: props.defaultValues?.title ?? "",
			content: props.defaultValues?.content ?? "",
			rentalFee: props.defaultValues?.rentalFee ?? 0,
			feeUnit: props.defaultValues?.feeUnit ?? "HOUR",
		};
	});

	const [images, setImages] = useState<PostEditorImageState>(() => ({
		existing: useMockExistingImages ? mockExistingImages : initialImages,
		added: [],
	}));

	const addedPreviewUrlsRef = useRef<Set<string>>(new Set());

	const [errors, setErrors] = useState<PostEditorErrors>({});
	const { mutateAsync: requestPostDraft, isPending: isGenerating } = useMutation<
		PostDraftResponse,
		CreatePostDraftError,
		File[]
	>({
		mutationFn: (files) => createPostDraft({ images: files }),
	});

	const hasAnyImages = useCallback(
		(state: PostEditorImageState) => state.existing.length + state.added.length > 0,
		[],
	);

	const validateWithZod = useCallback((input: PostEditorValues) => {
		const result = PostEditorSchema.safeParse(input);
		if (result.success) {
			return { ok: true as const };
		}

		const fieldErrors: PostEditorErrors = {};
		const flattened = result.error.flatten().fieldErrors;

		if (flattened.title?.[0]) {
			fieldErrors.title = flattened.title[0];
		}
		if (flattened.content?.[0]) {
			fieldErrors.content = flattened.content[0];
		}
		if (flattened.rentalFee?.[0]) {
			fieldErrors.rentalFee = flattened.rentalFee[0];
		}
		if (flattened.feeUnit?.[0]) {
			fieldErrors.feeUnit = flattened.feeUnit[0];
		}

		return { ok: false as const, errors: fieldErrors };
	}, []);

	const validateAll = useCallback(() => {
		const result = validateWithZod(values);
		const nextErrors: PostEditorErrors = result.ok ? {} : result.errors;

		if (!hasAnyImages(images)) {
			nextErrors.images = postValidationMessages.imagesRequired;
		}

		setErrors(nextErrors);
		return result.ok && !nextErrors.images;
	}, [hasAnyImages, images, validateWithZod, values]);

	const collectDraftImages = useCallback(async () => {
		const addedFiles = images.added.map((item) => item.file);
		if (!isEdit || images.existing.length === 0) {
			return addedFiles;
		}

		const existingFiles = await Promise.all(
			images.existing.map((image, index) =>
				createFileFromUrl(image.url, `existing-image-${image.id ?? index}`),
			),
		);
		return [...existingFiles, ...addedFiles];
	}, [images.added, images.existing, isEdit]);

	const onChangeField = useCallback(
		<Key extends keyof PostEditorValues>(key: Key, value: PostEditorValues[Key]) => {
			setValues((prev) => ({ ...prev, [key]: value }));
			setErrors((prev) => {
				if (!prev[key]) {
					return prev;
				}
				return { ...prev, [key]: undefined };
			});
		},
		[],
	);

	const compressImages = useCallback(async (files: File[]) => files, []);

	const onAddImages = useCallback(
		async (fileList: FileList | null) => {
			if (!fileList || fileList.length === 0) {
				return;
			}

			const compressed = await compressImages(Array.from(fileList));
			const nextAdded = compressed.map((file) => {
				const previewUrl = URL.createObjectURL(file);
				addedPreviewUrlsRef.current.add(previewUrl);
				return { file, previewUrl };
			});
			setImages((prev) => ({
				...prev,
				added: [...prev.added, ...nextAdded],
			}));
			setErrors((prev) => {
				if (!prev.images) {
					return prev;
				}
				return { ...prev, images: undefined };
			});
		},
		[compressImages],
	);

	const onRemoveExistingImage = useCallback((imageId: string) => {
		setImages((prev) => ({
			...prev,
			existing: prev.existing.filter((image) => image.id !== imageId),
		}));
	}, []);

	const onRemoveAddedImage = useCallback((index: number) => {
		setImages((prev) => {
			const target = prev.added[index];
			if (target) {
				URL.revokeObjectURL(target.previewUrl);
				addedPreviewUrlsRef.current.delete(target.previewUrl);
			}
			return {
				...prev,
				added: prev.added.filter((_, fileIndex) => fileIndex !== index),
			};
		});
	}, []);

	const onAutoWrite = useCallback(async () => {
		if (isSubmitting || isGenerating) {
			return;
		}

		if (!hasAnyImages(images)) {
			setErrors((prev) => ({
				...prev,
				images: postValidationMessages.imagesRequired,
			}));
			return;
		}

		try {
			const files = await collectDraftImages();
			const draft = await requestPostDraft(files);

			setValues({
				title: draft.title,
				content: draft.content,
				rentalFee: draft.rentalFee,
				feeUnit: draft.feeUnit,
			});

			setErrors((prev) => ({
				...prev,
				title: undefined,
				content: undefined,
				rentalFee: undefined,
				feeUnit: undefined,
				images: hasAnyImages(images) ? undefined : prev.images,
			}));
		} catch (error) {
			if (error instanceof CreatePostDraftError) {
				const message = getApiErrorMessage(error.code) ?? AI_DRAFT_ERROR_MESSAGE;
				toast.error(message);
				return;
			}

			const message =
				error instanceof Error && error.message === IMAGE_FETCH_ERROR_CODE
					? "이미지를 불러오지 못했습니다. 다시 시도해 주세요."
					: AI_DRAFT_ERROR_MESSAGE;
			toast.error(message);
		}
	}, [
		collectDraftImages,
		hasAnyImages,
		images,
		isGenerating,
		isSubmitting,
		requestPostDraft,
	]);

	const onSubmitForm = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!validateAll()) {
				return;
			}

			if (mode === "create") {
				if (!createSubmit) {
					return;
				}

				const payload: CreatePostPayload = {
					...values,
					newImages: images.added.map((item) => item.file),
				};
				await createSubmit(payload);
				return;
			}

			if (!editSubmit || !postId) {
				return;
			}

			const payload: EditPostPayload = {
				...values,
				postId,
				keepImageIds: images.existing.map((image) => image.id),
				newImages: images.added.map((item) => item.file),
			};
			await editSubmit(payload);
		},
		[createSubmit, editSubmit, images, mode, postId, validateAll, values],
	);

	useEffect(() => {
		return () => {
			addedPreviewUrlsRef.current.forEach((previewUrl) => {
				URL.revokeObjectURL(previewUrl);
			});
			// eslint-disable-next-line react-hooks/exhaustive-deps
			addedPreviewUrlsRef.current.clear();
		};
	}, []);

	return {
		values,
		images,
		errors,
		isSubmitting,
		onChangeField,
		onAddImages,
		onRemoveExistingImage,
		onRemoveAddedImage,
		onAutoWrite,
		onSubmitForm,
		isGenerating,
	};
}
