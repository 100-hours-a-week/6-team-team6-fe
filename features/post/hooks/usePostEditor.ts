"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { z } from "zod";

export type FeeUnit = "HOUR" | "DAY";

export interface ExistingImage {
	id: string;
	url: string;
}

const mockExistingImages: ExistingImage[] = [
	{ id: "mock-1", url: "/dummy-post-image.png" },
	{ id: "mock-2", url: "/default-profile.png" },
	{ id: "mock-3", url: "/dummy-post-image.png" },
];

export interface AddedImage {
	file: File;
	previewUrl: string;
}

export interface PostEditorImageState {
	existing: ExistingImage[];
	added: AddedImage[];
}

export interface PostEditorValues {
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
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

const postEditorSchema = z.object({
	title: z.string().min(1, "글 제목을 입력해 주세요."),
	content: z.string().min(1, "내용을 입력해 주세요."),
	rentalFee: z.number().min(0, "대여료는 0 이상이어야 합니다."),
	feeUnit: z.enum(["HOUR", "DAY", "WEEK"]),
});

interface UsePostEditorResult {
	values: PostEditorValues;
	images: PostEditorImageState;
	errors: PostEditorErrors;
	isSubmitting: boolean;
	onChangeField: <Key extends keyof PostEditorValues>(
		key: Key,
		value: PostEditorValues[Key],
	) => void;
	onAddImages: (fileList: FileList | null) => Promise<void>;
	onRemoveExistingImage: (imageId: string) => void;
	onRemoveAddedImage: (index: number) => void;
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

	const validateWithZod = useCallback((input: PostEditorValues) => {
		const result = postEditorSchema.safeParse(input);
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
		if (result.ok) {
			setErrors({});
			return true;
		}
		setErrors(result.errors);
		return false;
	}, [validateWithZod, values]);

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
		onSubmitForm,
	};
}
