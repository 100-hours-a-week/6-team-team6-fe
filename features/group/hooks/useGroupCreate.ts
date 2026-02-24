"use client";

import {
	type BaseSyntheticEvent,
	type ChangeEvent,
	type FormEventHandler,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn, useWatch } from "react-hook-form";
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
	GROUP_CREATE_MESSAGES,
} from "@/features/group/lib/constants";
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

import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { getApiErrorCode } from "@/shared/lib/api/error-guards";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { isDirectPreviewImageSrc, normalizeImageSrcForNextImage } from "@/shared/lib/image-src";

interface UseGroupCreateOptions {
	onCreateSuccess: () => void;
}

interface GroupCreateState {
	form: UseFormReturn<GroupCreateFormValues>;
	fileInputRef: RefObject<HTMLInputElement | null>;
	selectedCoverType: "default" | "custom";
	selectedDefaultCoverImageUrl: string;
	selectedCoverImageUrl: string;
	selectedCoverPreviewUrl: string;
	customCoverThumbnailUrl: string | null;
	isUploadingCustomImage: boolean;
	isCreatingGroup: boolean;
	isBusy: boolean;
	isSubmitDisabled: boolean;
	shouldUseUnoptimizedMainPreviewImage: boolean;
}

interface GroupCreateActions {
	openCustomImagePicker: () => void;
	uploadCustomImage: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
	selectCustomCover: () => void;
	selectDefaultCover: (imageUrl: string) => void;
	submit: FormEventHandler<HTMLFormElement>;
}

type PickerInput = HTMLInputElement & {
	showPicker?: () => void;
};

const isValidGroupCoverFile = (file: File) => {
	const isSupportedFileType = file.type === "image/jpeg" || file.type === "image/png";
	const isAllowedFileSize = file.size <= MAX_UPLOAD_IMAGE_SIZE_BYTES;
	return isSupportedFileType && isAllowedFileSize;
};

const resolveCreateGroupErrorMessage = (error: unknown) => {
	const errorCode = getApiErrorCode(error);
	return getApiErrorMessage(errorCode) ?? GROUP_CREATE_MESSAGES.createFailed;
};

function useGroupCreate(options: UseGroupCreateOptions): {
	state: GroupCreateState;
	actions: GroupCreateActions;
} {
	const { onCreateSuccess } = options;
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
			void queryClient.invalidateQueries({ queryKey: groupQueryKeys.myGroups() });
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

	const openCustomImagePicker = useCallback(() => {
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

	const uploadCustomImage = useCallback(
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

	const selectCustomCover = useCallback(() => {
		setSelectedCoverType("custom");
	}, []);

	const selectDefaultCover = useCallback((imageUrl: string) => {
		setSelectedCoverType("default");
		setSelectedDefaultCoverImageUrl(imageUrl);
	}, []);

	const submit = form.handleSubmit(async (values) => {
		if (isBusy) {
			return;
		}

		try {
			await createGroupMutation.mutateAsync({
				groupName: values.groupName,
				groupCoverImageUrl: selectedCoverImageUrl,
			});
			onCreateSuccess();
		} catch (error) {
			toast.error(resolveCreateGroupErrorMessage(error));
		}
	}) as (event?: BaseSyntheticEvent) => Promise<void>;

	const isSubmitDisabled = isBusy || !isGroupNameValid || selectedCoverImageUrl.length === 0;

	return {
		state: {
			form,
			fileInputRef,
			selectedCoverType,
			selectedDefaultCoverImageUrl,
			selectedCoverImageUrl,
			selectedCoverPreviewUrl,
			customCoverThumbnailUrl,
			isUploadingCustomImage,
			isCreatingGroup,
			isBusy,
			isSubmitDisabled,
			shouldUseUnoptimizedMainPreviewImage,
		},
		actions: {
			openCustomImagePicker,
			uploadCustomImage,
			selectCustomCover,
			selectDefaultCover,
			submit,
		},
	};
}

export type { GroupCreateActions, GroupCreateState, UseGroupCreateOptions };
export { useGroupCreate };
