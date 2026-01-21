"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { Plus, X } from "lucide-react";
import { z } from "zod";

import PostEditorNavigation from "@/shared/components/layout/bottomNavigations/PostEditorNavigation";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Typography } from "@/shared/components/ui/typography";

type FeeUnit = "HOUR" | "DAY";

interface ExistingImage {
	id: string;
	url: string;
}

const mockExistingImages: ExistingImage[] = [
	{ id: "mock-1", url: "/dummy-post-image.png" },
	{ id: "mock-2", url: "/default-profile.png" },
	{ id: "mock-3", url: "/dummy-post-image.png" },
];

interface AddedImage {
	file: File;
	previewUrl: string;
}

interface PostEditorImageState {
	existing: ExistingImage[];
	added: AddedImage[];
}

interface PostEditorValues {
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
}

interface CreatePostEditorProps {
	mode: "create";
	defaultValues?: Partial<PostEditorValues>;
	isSubmitting?: boolean;
	onCancel?: () => void;
	onSubmit: (payload: CreatePostPayload) => void | Promise<void>;
}

interface CreatePostPayload extends PostEditorValues {
	newImages: File[];
}

interface EditPostEditorProps {
	mode: "edit";
	postId: string;
	initialValues: PostEditorValues & {
		images: ExistingImage[];
	};
	isSubmitting?: boolean;
	onCancel?: () => void;
	onSubmit: (payload: EditPostPayload) => void | Promise<void>;
}

interface EditPostPayload extends PostEditorValues {
	postId: string;
	keepImageIds: string[];
	newImages: File[];
}

type RentalItemPostEditorProps = CreatePostEditorProps | EditPostEditorProps;

type PostEditorErrors = Partial<Record<keyof PostEditorValues, string>> & {
	images?: string;
};

const postEditorSchema = z.object({
	title: z.string().min(1, "글 제목을 입력해 주세요."),
	content: z.string().min(1, "내용을 입력해 주세요."),
	rentalFee: z.number().min(0, "대여료는 0 이상이어야 합니다."),
	feeUnit: z.enum(["HOUR", "DAY", "WEEK"]),
});

const rentalUnitOptions: Array<{ value: FeeUnit; label: string }> = [
	{ value: "HOUR", label: "시간" },
	{ value: "DAY", label: "일" },
];

function PostEditor(props: RentalItemPostEditorProps) {
	const isEdit = props.mode === "edit";
	const isSubmitting = props.isSubmitting ?? false;
	const useMockExistingImages =
		process.env.NODE_ENV === "development" && isEdit && props.initialValues.images.length === 0;

	const [values, setValues] = useState<PostEditorValues>(() => {
		if (isEdit) {
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
		existing: useMockExistingImages ? mockExistingImages : isEdit ? props.initialValues.images : [],
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

	useEffect(() => {
		return () => {
			addedPreviewUrlsRef.current.forEach((previewUrl) => {
				URL.revokeObjectURL(previewUrl);
			});
			// eslint-disable-next-line react-hooks/exhaustive-deps
			addedPreviewUrlsRef.current.clear();
		};
	}, []);

	const onSubmitForm = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!validateAll()) {
				return;
			}

			if (props.mode === "create") {
				const payload: CreatePostPayload = {
					...values,
					newImages: images.added.map((item) => item.file),
				};
				await props.onSubmit(payload);
				return;
			}

			const payload: EditPostPayload = {
				...values,
				postId: props.postId,
				keepImageIds: images.existing.map((image) => image.id),
				newImages: images.added.map((item) => item.file),
			};
			await props.onSubmit(payload);
		},
		[images, props, validateAll, values],
	);

	return (
		<>
			<form className="flex flex-col gap-6" onSubmit={onSubmitForm}>
				<div className="flex flex-col gap-2">
					<Input
						id="post-images"
						type="file"
						accept="image/*"
						multiple
						disabled={isSubmitting}
						className="sr-only"
						onChange={(event) => onAddImages(event.target.files)}
					/>
					<div className="flex flex-col gap-2 mt-2">
						<ul className="flex gap-2 overflow-scroll mx-(--p-layout-horizontal)">
							<li className="flex items-center gap-2">
								<Label
									htmlFor="post-images"
									className={`w-19 h-19 flex items-center justify-center rounded-md border border-dashed text-muted-foreground transition ${
										isSubmitting
											? "pointer-events-none opacity-50"
											: "cursor-pointer hover:text-foreground hover:border-foreground/60"
									}`}
								>
									<Plus className="h-5 w-5" />
									<span className="sr-only">이미지 추가</span>
								</Label>
							</li>
							{images.existing.length > 0 &&
								images.existing.map((image) => {
									console.log(image);
									return (
										<li key={image.id} className="flex items-center justify-between gap-2">
											<div className="w-19 h-19 relative overflow-hidden ">
												<div className="absolute top-0 right-0 z-1">
													<IconButton
														onClick={() => onRemoveExistingImage(image.id)}
														disabled={isSubmitting}
														icon={<X />}
													/>
												</div>
												<Image alt="" src={image.url} width={100} height={100} />
											</div>
										</li>
									);
								})}
							{images.added.map((addedImage, index) => {
								return (
									<li key={`${addedImage.file.name}-${index}`} className="flex items-center gap-2">
										<div className="w-19 h-19 relative overflow-hidden ">
											<div className="absolute top-0 right-0 z-1 ">
												<IconButton
													onClick={() => onRemoveAddedImage(index)}
													disabled={isSubmitting}
													icon={<X />}
												/>
											</div>
											<Image
												alt=""
												src={addedImage.previewUrl}
												fill
												sizes="76px"
												className="object-cover"
											/>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
					{errors.images && (
						<Typography type="caption" className="text-destructive">
							{errors.images}
						</Typography>
					)}
				</div>

				<HorizontalPaddingBox>
					<div>
						<Button type="button">AI 자동 작성</Button>
					</div>
				</HorizontalPaddingBox>

				<HorizontalPaddingBox className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label className="text-sm font-bold" htmlFor="post-title">
							제목
						</Label>
						<Input
							id="post-title"
							value={values.title}
							onChange={(event) => onChangeField("title", event.target.value)}
							aria-invalid={!!errors.title}
							disabled={isSubmitting}
						/>
						{errors.title && (
							<Typography type="caption" className="text-destructive">
								{errors.title}
							</Typography>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label className="text-sm font-bold" htmlFor="post-content">
							내용
						</Label>
						<Textarea
							id="post-content"
							value={values.content}
							onChange={(event) => onChangeField("content", event.target.value)}
							aria-invalid={!!errors.content}
							disabled={isSubmitting}
							className="resize-none"
						/>
						{errors.content && (
							<Typography type="caption" className="text-destructive">
								{errors.content}
							</Typography>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label className="text-sm font-bold" htmlFor="post-rentalFee">
							대여료
						</Label>
						<div className="flex items-center gap-2">
							<Input
								id="post-rentalFee"
								type="number"
								inputMode="numeric"
								min={0}
								value={Number.isNaN(values.rentalFee) ? "" : values.rentalFee}
								onChange={(event) => {
									const nextValue = Number(event.target.value);
									onChangeField("rentalFee", Number.isNaN(nextValue) ? 0 : nextValue);
								}}
								aria-invalid={!!errors.rentalFee}
								disabled={isSubmitting}
							/>
							<Select
								value={values.feeUnit}
								onValueChange={(value) => onChangeField("feeUnit", value as FeeUnit)}
								disabled={isSubmitting}
							>
								<SelectTrigger size="sm" aria-label="대여 단위">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{rentalUnitOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{errors.rentalFee && (
							<Typography type="caption" className="text-destructive">
								{errors.rentalFee}
							</Typography>
						)}
						{errors.feeUnit && (
							<Typography type="caption" className="text-destructive">
								{errors.feeUnit}
							</Typography>
						)}
					</div>
				</HorizontalPaddingBox>

				<div className="flex items-center gap-2 ">
					{props.onCancel && (
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={props.onCancel}
							disabled={isSubmitting}
						>
							취소
						</Button>
					)}
				</div>
				<PostEditorNavigation mode={props.mode} onClick={() => {}} />
			</form>
		</>
	);
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
