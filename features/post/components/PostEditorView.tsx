"use client";

import { type FormEvent, useState } from "react";

import Image from "next/image";

import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import PostEditorNavigation from "@/features/post/components/PostEditorNavigation";
import type {
	PostEditorErrors,
	PostEditorImageState,
	PostEditorValues,
} from "@/features/post/hooks/usePostEditor";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { SelectField, type SelectOption } from "@/shared/components/ui/select-field";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Typography } from "@/shared/components/ui/typography";

const rentalUnitOptions: SelectOption[] = [
	{ value: "HOUR", label: "시간" },
	{ value: "DAY", label: "일" },
];
const MAX_POST_IMAGES = 5;

type RentalFeeParseResult = { kind: "empty" } | { kind: "valid"; value: number; text: string };

const sanitizeRentalFeeInput = (input: string) => input.replace(/[^\d]/g, "");

const parseRentalFeeInput = (input: string): RentalFeeParseResult => {
	const digitsOnly = sanitizeRentalFeeInput(input);
	if (digitsOnly === "") {
		return { kind: "empty" };
	}
	const value = Number(digitsOnly);
	if (!Number.isFinite(value)) {
		return { kind: "empty" };
	}
	return { kind: "valid", value, text: digitsOnly };
};

interface PostEditorViewProps {
	mode: "create" | "edit";
	values: PostEditorValues;
	images: PostEditorImageState;
	errors: PostEditorErrors;
	isSubmitting: boolean;
	isGenerating: boolean;
	isAddingImages: boolean;
	onChangeField: <Key extends keyof PostEditorValues>(
		key: Key,
		value: PostEditorValues[Key],
	) => void;
	onAddImages: (fileList: FileList | null) => void | Promise<void>;
	onRemoveExistingImage: (imageId: string) => void;
	onRemoveAddedImage: (index: number) => void;
	onAutoWrite: () => void | Promise<void>;
	onSubmitForm: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
	onCancel?: () => void;
}

export function PostEditorView(props: PostEditorViewProps) {
	const {
		mode,
		values,
		images,
		errors,
		isSubmitting,
		isGenerating,
		isAddingImages,
		onChangeField,
		onAddImages,
		onRemoveExistingImage,
		onRemoveAddedImage,
		onAutoWrite,
		onSubmitForm,
		onCancel,
	} = props;

	const totalImageCount = images.existing.length + images.added.length;
	const remainingImageSlots = Math.max(0, MAX_POST_IMAGES - totalImageCount);
	const isAtImageLimit = remainingImageSlots === 0;
	const isBusy = isSubmitting || isAddingImages;
	const [rentalFeeInput, setRentalFeeInput] = useState("");
	const [isRentalFeeDirty, setIsRentalFeeDirty] = useState(false);
	const rentalFeeText =
		values.rentalFee === 0 || Number.isNaN(values.rentalFee) ? "" : String(values.rentalFee);
	const rentalFeeDisplay = isRentalFeeDirty ? rentalFeeInput : rentalFeeText;

	return (
		<>
			<form className="flex flex-col gap-6" onSubmit={onSubmitForm}>
				<div className="flex flex-col gap-2">
					<Input
						id="post-images"
						type="file"
						accept="image/*"
						multiple
						disabled={isBusy || isAtImageLimit}
						className="sr-only"
						onChange={(event) => {
							const { files } = event.currentTarget;
							if (!files || files.length === 0) {
								return;
							}

							if (remainingImageSlots === 0) {
								event.currentTarget.value = "";
								return;
							}

							if (files.length > remainingImageSlots) {
								toast.error(`이미지는 최대 ${MAX_POST_IMAGES}장까지 업로드할 수 있어요.`);
								event.currentTarget.value = "";
								return;
							}

							onAddImages(files);
							event.currentTarget.value = "";
						}}
					/>
					<div className="flex flex-col gap-2 mt-2">
						<ul className="flex gap-2 overflow-scroll no-scrollbar mx-(--p-layout-horizontal)">
							<li className="flex items-center gap-2">
								<Label
									htmlFor="post-images"
									className={`w-19 h-19 flex items-center justify-center rounded-md border border-dashed text-muted-foreground transition ${
										isBusy || isAtImageLimit
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
									return (
										<li key={image.id} className="flex items-center justify-between gap-2">
											<div className="w-19 h-19 relative">
												<div className="absolute top-0 right-0 z-1">
													<IconButton
														onClick={() => onRemoveExistingImage(image.id)}
														disabled={isBusy}
														icon={<X />}
													/>
												</div>
												<Image
													className="object-cover"
													alt=""
													src={image.url}
													width={100}
													height={100}
												/>
											</div>
										</li>
									);
								})}
							{images.added.map((addedImage, index) => {
								return (
									<li key={`${addedImage.file.name}-${index}`} className="flex items-center gap-2">
										<div className="w-19 h-19 relative ">
											<div className="absolute top-0 right-0 z-1 ">
												<IconButton
													onClick={() => onRemoveAddedImage(index)}
													disabled={isBusy}
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
						<HorizontalPaddingBox>
							<Typography type="caption" className="text-destructive">
								{errors.images}
							</Typography>
						</HorizontalPaddingBox>
					)}
					{isAddingImages && (
						<HorizontalPaddingBox>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Spinner />
								<Typography type="caption">이미지 등록중</Typography>
							</div>
						</HorizontalPaddingBox>
					)}
				</div>

				<HorizontalPaddingBox>
					<div>
						<Button type="button" disabled={isBusy || isGenerating} onClick={onAutoWrite}>
							{isGenerating && <Spinner className="text-white" />}
							{isGenerating ? "AI 작성 중..." : "AI 자동 작성"}
						</Button>
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
							disabled={isBusy}
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
							disabled={isBusy}
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
								type="text"
								inputMode="numeric"
								value={rentalFeeDisplay}
								placeholder="0"
								onKeyDown={(event) => {
									if (event.key === ".") {
										event.preventDefault();
									}
								}}
								onFocus={() => {
									setIsRentalFeeDirty(true);
									setRentalFeeInput(rentalFeeText);
								}}
								onBlur={(event) => {
									const result = parseRentalFeeInput(event.currentTarget.value);
									if (result.kind === "empty") {
										setRentalFeeInput("");
										setIsRentalFeeDirty(false);
										onChangeField("rentalFee", 0);
										return;
									}
									setRentalFeeInput(String(result.value));
									setIsRentalFeeDirty(false);
									onChangeField("rentalFee", result.value);
								}}
								onChange={(event) => {
									const nextInput = event.target.value;
									const result = parseRentalFeeInput(nextInput);
									setIsRentalFeeDirty(true);
									if (result.kind === "empty") {
										setRentalFeeInput("");
										onChangeField("rentalFee", 0);
										return;
									}
									setRentalFeeInput(result.text);
									onChangeField("rentalFee", result.value);
								}}
								aria-invalid={!!errors.rentalFee}
								disabled={isBusy}
							/>
							<SelectField
								value={values.feeUnit}
								onValueChange={(value) =>
									onChangeField("feeUnit", value as PostEditorValues["feeUnit"])
								}
								disabled={isBusy}
								options={rentalUnitOptions}
								ariaLabel="대여 단위"
								size="sm"
							/>
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
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={onCancel}
							disabled={isBusy}
						>
							취소
						</Button>
					)}
				</div>
				<PostEditorNavigation mode={mode} disabled={isBusy} onClick={() => {}} />
			</form>
		</>
	);
}
