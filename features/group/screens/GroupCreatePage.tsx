"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ImageIcon, ImagePlusIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
	createGroup,
	type CreateGroupError,
	type CreateGroupParams,
} from "@/features/group/api/createGroup";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";
import {
	uploadGroupImage,
	type UploadGroupImageError,
} from "@/features/group/api/uploadGroupImage";
import {
	DEFAULT_GROUP_COVER_IMAGES,
	GROUP_CREATE_IMAGE_INPUT_ACCEPT,
	GROUP_CREATE_LABELS,
	GROUP_CREATE_MESSAGES,
} from "@/features/group/lib/constants";
import { groupRoutes } from "@/features/group/lib/groupRoutes";
import {
	GroupCreateFormSchema,
	type GroupCreateFormValues,
	type GroupCreateResponseDto,
} from "@/features/group/schemas";
import { compressPostImage } from "@/features/post/lib/compressPostImages";
import {
	IMAGE_COMPRESS_WARNING_MESSAGE,
	MAX_UPLOAD_IMAGE_SIZE_BYTES,
} from "@/features/post/lib/postEditorUtils";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { isDirectPreviewImageSrc, normalizeImageSrcForNextImage } from "@/shared/lib/image-src";
import { cn } from "@/shared/lib/utils";

const isValidGroupCoverFile = (file: File) => {
	const isSupportedFileType = file.type === "image/jpeg" || file.type === "image/png";
	const isAllowedFileSize = file.size <= MAX_UPLOAD_IMAGE_SIZE_BYTES;
	return isSupportedFileType && isAllowedFileSize;
};

const resolveCreateGroupErrorMessage = (error: unknown) => {
	const errorCode = getApiErrorCode(error);
	return getApiErrorMessage(errorCode) ?? GROUP_CREATE_MESSAGES.createFailed;
};

type PickerInput = HTMLInputElement & {
	showPicker?: () => void;
};

interface CoverOptionButtonProps {
	imageUrl: string;
	label: string;
	selected: boolean;
	onClick: () => void;
	disabled: boolean;
}

function CoverOptionButton(props: CoverOptionButtonProps) {
	const { imageUrl, label, selected, onClick, disabled } = props;
	const normalizedImageUrl = normalizeImageSrcForNextImage(imageUrl);
	const shouldUseUnoptimizedImage = normalizedImageUrl
		? isDirectPreviewImageSrc(normalizedImageUrl)
		: false;

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border bg-muted transition",
				selected ? "border-primary ring ring-primary" : "border-border",
				!disabled && "cursor-pointer",
			)}
		>
			{normalizedImageUrl ? (
				<Image
					src={normalizedImageUrl}
					alt={label}
					fill
					sizes="56px"
					unoptimized={shouldUseUnoptimizedImage}
					className="object-cover"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center text-muted-foreground">
					<ImageIcon className="size-5" />
				</div>
			)}
			<span
				className={cn(
					"absolute left-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-background",
					selected ? "border-primary text-primary" : "border-border",
				)}
			>
				{selected ? <CheckIcon className="size-2.5" /> : null}
			</span>
		</button>
	);
}

export function GroupCreatePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [customCoverImageUrl, setCustomCoverImageUrl] = useState<string | null>(null);
	const [customCoverPreviewUrl, setCustomCoverPreviewUrl] = useState<string | null>(null);
	const [selectedDefaultCoverImageUrl, setSelectedDefaultCoverImageUrl] = useState<string>(
		DEFAULT_GROUP_COVER_IMAGES[0],
	);
	const [selectedCoverType, setSelectedCoverType] = useState<"default" | "custom">("default");

	const form = useForm<GroupCreateFormValues>({
		resolver: zodResolver(GroupCreateFormSchema),
		defaultValues: {
			groupName: "",
		},
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const uploadGroupImageMutation = useMutation<string, UploadGroupImageError, File>({
		mutationFn: (file) => uploadGroupImage({ file }),
	});

	const createGroupMutation = useMutation<
		GroupCreateResponseDto,
		CreateGroupError,
		CreateGroupParams
	>({
		mutationFn: createGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupQueryKeys.myGroups() });
		},
	});

	const isUploadingCustomImage = uploadGroupImageMutation.isPending;
	const isCreatingGroup = createGroupMutation.isPending;
	const isBusy = isUploadingCustomImage || isCreatingGroup;
	const normalizedFallbackCoverImageUrl =
		normalizeImageSrcForNextImage(DEFAULT_GROUP_COVER_IMAGES[0]) ?? DEFAULT_GROUP_COVER_IMAGES[0];
	const selectedCoverImageUrl =
		selectedCoverType === "custom" ? (customCoverImageUrl ?? "") : selectedDefaultCoverImageUrl;
	const selectedCoverPreviewUrl = useMemo(() => {
		if (selectedCoverType === "custom") {
			if (customCoverPreviewUrl) {
				return customCoverPreviewUrl;
			}
			if (customCoverImageUrl) {
				return (
					normalizeImageSrcForNextImage(customCoverImageUrl) ?? normalizedFallbackCoverImageUrl
				);
			}
			return (
				normalizeImageSrcForNextImage(selectedDefaultCoverImageUrl) ??
				normalizedFallbackCoverImageUrl
			);
		}
		return (
			normalizeImageSrcForNextImage(selectedDefaultCoverImageUrl) ?? normalizedFallbackCoverImageUrl
		);
	}, [
		customCoverImageUrl,
		customCoverPreviewUrl,
		normalizedFallbackCoverImageUrl,
		selectedCoverType,
		selectedDefaultCoverImageUrl,
	]);
	const shouldUseUnoptimizedMainPreviewImage = isDirectPreviewImageSrc(selectedCoverPreviewUrl);
	const customCoverThumbnailUrl = customCoverPreviewUrl ?? customCoverImageUrl;
	const watchedGroupName =
		useWatch({
			control: form.control,
			name: "groupName",
		}) ?? "";
	const isGroupNameValid = useMemo(
		() => GroupCreateFormSchema.safeParse({ groupName: watchedGroupName }).success,
		[watchedGroupName],
	);

	useEffect(() => {
		return () => {
			if (customCoverPreviewUrl && customCoverPreviewUrl.startsWith("blob:")) {
				URL.revokeObjectURL(customCoverPreviewUrl);
			}
		};
	}, [customCoverPreviewUrl]);

	const handleOpenCustomImagePicker = useCallback(() => {
		if (isBusy) {
			return;
		}

		const input = fileInputRef.current;
		if (!input) {
			return;
		}

		const pickerInput = input as PickerInput;
		try {
			if (typeof pickerInput.showPicker === "function") {
				pickerInput.showPicker();
				return;
			}
			input.click();
		} catch (error) {
			if (error instanceof DOMException && error.name === "NotAllowedError") {
				toast.error(GROUP_CREATE_MESSAGES.imagePermissionRequired);
				return;
			}
			input.click();
		}
	}, [isBusy]);

	const handleUploadCustomImage = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0] ?? null;
			event.target.value = "";

			if (!file) {
				return;
			}

			if (!isValidGroupCoverFile(file)) {
				toast.error(GROUP_CREATE_MESSAGES.imageInvalid);
				return;
			}

			const previewUrl = URL.createObjectURL(file);
			setCustomCoverPreviewUrl((previousPreviewUrl) => {
				if (previousPreviewUrl && previousPreviewUrl.startsWith("blob:")) {
					URL.revokeObjectURL(previousPreviewUrl);
				}
				return previewUrl;
			});
			setSelectedCoverType("custom");

			try {
				let uploadTargetFile = file;
				try {
					uploadTargetFile = await compressPostImage(file);
				} catch {
					toast.warning(IMAGE_COMPRESS_WARNING_MESSAGE);
				}

				const uploadedImageUrl = await uploadGroupImageMutation.mutateAsync(uploadTargetFile);
				setCustomCoverImageUrl(uploadedImageUrl);
			} catch (error) {
				const errorCode = getApiErrorCode(error);
				if (
					errorCode === apiErrorCodes.IMAGE_TOO_LARGE ||
					errorCode === apiErrorCodes.IMAGE_UNSUPPORTED_TYPE
				) {
					toast.error(GROUP_CREATE_MESSAGES.imageInvalid);
					return;
				}
				toast.error(GROUP_CREATE_MESSAGES.imageUploadFailed);
			}
		},
		[uploadGroupImageMutation],
	);

	const onSubmit = form.handleSubmit(async (values) => {
		if (isBusy) {
			return;
		}

		try {
			await createGroupMutation.mutateAsync({
				groupName: values.groupName,
				groupCoverImageUrl: selectedCoverImageUrl,
			});
			router.replace(groupRoutes.list());
		} catch (error) {
			toast.error(resolveCreateGroupErrorMessage(error));
		}
	});

	const isSubmitDisabled = isBusy || !isGroupNameValid || selectedCoverImageUrl.length === 0;

	return (
		<>
			<TitleBackHeader title={GROUP_CREATE_LABELS.title} />
			<section className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
				<div className="flex flex-1 flex-col px-5 py-8 pb-10 ">
					<div className="flex flex-col gap-4">
						<div className="mx-auto w-full max-w-40">
							<div className="relative aspect-square w-full overflow-hidden">
								<Image
									src={selectedCoverPreviewUrl}
									alt={GROUP_CREATE_LABELS.selectedCoverAlt}
									fill
									sizes="(max-width: 480px) 100vw"
									unoptimized={shouldUseUnoptimizedMainPreviewImage}
									className="object-cover"
								/>
								{isUploadingCustomImage ? (
									<div className="absolute inset-0 flex items-center justify-center bg-black/35">
										<Spinner className="size-5 text-white" />
									</div>
								) : null}
							</div>
						</div>

						<div className=" py-2">
							<Typography type="subtitle">{GROUP_CREATE_LABELS.coverSelectionTitle}</Typography>
							<div className="mt-2 flex flex-wrap items-center gap-1 overflow-x-auto no-scrollbar pb-1">
								<button
									type="button"
									onClick={handleOpenCustomImagePicker}
									disabled={isBusy}
									className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-dashed border-border bg-muted text-foreground"
								>
									{isUploadingCustomImage ? (
										<Spinner className="size-4" />
									) : (
										<ImagePlusIcon className="size-6" />
									)}
									<input
										ref={fileInputRef}
										type="file"
										accept={GROUP_CREATE_IMAGE_INPUT_ACCEPT}
										disabled={isBusy}
										className="sr-only"
										onChange={handleUploadCustomImage}
									/>
								</button>

								{customCoverThumbnailUrl ? (
									<CoverOptionButton
										imageUrl={customCoverThumbnailUrl}
										label={GROUP_CREATE_LABELS.uploadedCoverLabel}
										selected={selectedCoverType === "custom"}
										onClick={() => setSelectedCoverType("custom")}
										disabled={isBusy}
									/>
								) : null}

								{DEFAULT_GROUP_COVER_IMAGES.map((imageUrl, index) => (
									<CoverOptionButton
										key={imageUrl}
										imageUrl={imageUrl}
										label={`${GROUP_CREATE_LABELS.defaultCoverLabelPrefix} ${index + 1}`}
										selected={
											selectedCoverType === "default" && selectedDefaultCoverImageUrl === imageUrl
										}
										onClick={() => {
											setSelectedCoverType("default");
											setSelectedDefaultCoverImageUrl(imageUrl);
										}}
										disabled={isBusy}
									/>
								))}
							</div>
						</div>
					</div>

					{/* <div className="mt-12"> */}
					<Form {...form}>
						<form onSubmit={onSubmit} className="flex flex-col gap-10 justify-between flex-1 ">
							<FormField
								control={form.control}
								name="groupName"
								render={({ field, fieldState }) => (
									<FormItem className="gap-2">
										<FormLabel>
											<Typography type="subtitle">{GROUP_CREATE_LABELS.groupNameLabel}</Typography>
										</FormLabel>
										<FormControl>
											<Input
												placeholder={GROUP_CREATE_LABELS.groupNamePlaceholder}
												autoComplete="off"
												disabled={isBusy}
												aria-invalid={Boolean(fieldState.error)}
												className="h-14 rounded-none border border-border px-3 text-xl"
												{...field}
											/>
										</FormControl>
										{fieldState.error?.message ? (
											<Typography type="caption" className="text-destructive">
												* {fieldState.error.message}
											</Typography>
										) : null}
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								size="xl"
								disabled={isSubmitDisabled}
								className="h-14 w-full rounded-none "
							>
								{isCreatingGroup ? (
									<span className="flex items-center gap-2">
										<Spinner className="size-5" />
										{GROUP_CREATE_LABELS.submitting}
									</span>
								) : (
									GROUP_CREATE_LABELS.submit
								)}
							</Button>
						</form>
					</Form>
					{/* </div> */}
				</div>
			</section>
		</>
	);
}
