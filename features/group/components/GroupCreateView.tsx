import Image from "next/image";

import { CheckIcon, ImageIcon, ImagePlusIcon } from "lucide-react";

import type {
	GroupCreateActions,
	GroupCreateState,
} from "@/features/group/hooks/useGroupCreate";
import {
	DEFAULT_GROUP_COVER_IMAGES,
	GROUP_CREATE_IMAGE_INPUT_ACCEPT,
	GROUP_CREATE_LABELS,
} from "@/features/group/lib/constants";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { isDirectPreviewImageSrc, normalizeImageSrcForNextImage } from "@/shared/lib/image-src";
import { cn } from "@/shared/lib/utils";

interface GroupCreateViewProps {
	state: GroupCreateState;
	actions: GroupCreateActions;
}

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

function GroupCreateView(props: GroupCreateViewProps) {
	const { state, actions } = props;
	const {
		form,
		fileInputRef,
		selectedCoverType,
		selectedDefaultCoverImageUrl,
		selectedCoverPreviewUrl,
		customCoverThumbnailUrl,
		isUploadingCustomImage,
		isCreatingGroup,
		isBusy,
		isSubmitDisabled,
		shouldUseUnoptimizedMainPreviewImage,
	} = state;

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
									onClick={actions.openCustomImagePicker}
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
										onChange={actions.uploadCustomImage}
									/>
								</button>

								{customCoverThumbnailUrl ? (
									<CoverOptionButton
										imageUrl={customCoverThumbnailUrl}
										label={GROUP_CREATE_LABELS.uploadedCoverLabel}
										selected={selectedCoverType === "custom"}
										onClick={actions.selectCustomCover}
										disabled={isBusy}
									/>
								) : null}

								{DEFAULT_GROUP_COVER_IMAGES.map((imageUrl, index) => (
									<CoverOptionButton
										key={imageUrl}
										imageUrl={imageUrl}
										label={`${GROUP_CREATE_LABELS.defaultCoverLabelPrefix} ${index + 1}`}
										selected={
											selectedCoverType === "default" &&
											selectedDefaultCoverImageUrl === imageUrl
										}
										onClick={() => actions.selectDefaultCover(imageUrl)}
										disabled={isBusy}
									/>
								))}
							</div>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={actions.submit} className="flex flex-col gap-10 justify-between flex-1 ">
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
				</div>
			</section>
		</>
	);
}

export { GroupCreateView };
export type { GroupCreateViewProps };
