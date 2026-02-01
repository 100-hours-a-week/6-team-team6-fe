import { z } from "zod";

import { postValidationMessages } from "@/shared/lib/error-messages";

const feeUnitSchema = z.enum(["HOUR", "DAY"]);
const rentalStatusSchema = z.enum(["AVAILABLE", "RENTED_OUT"]);

const PostSummaryDtoSchema = z.object({
	postId: z.number(),
	postTitle: z.string().min(1),
	postImageId: z.number(),
	postFirstImageUrl: z.string().min(1),
	rentalFee: z.number().min(0),
	feeUnit: feeUnitSchema,
	rentalStatus: rentalStatusSchema,
});

const PostSummariesSchema = z.array(PostSummaryDtoSchema);

const PostSummariesResponseDtoSchema = z.object({
	summaries: PostSummariesSchema,
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

const PostSummariesResponseApiSchema = z.object({
	summaries: PostSummariesSchema,
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

const PostImageInfoDtoSchema = z.object({
	postImageId: z.number(),
	imageUrl: z.string().min(1),
});

const PostDetailBaseSchema = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	sellerId: z.number(),
	sellerNickname: z.string().min(1),
	sellerAvatar: z.string().min(1),
	rentalFee: z.number().min(0),
	feeUnit: feeUnitSchema,
	rentalStatus: rentalStatusSchema,
	updatedAt: z.string().min(1),
	isSeller: z.boolean(),
	chatroomId: z.number().nullable(),
	activeChatroomCount: z.number().nullable(),
});

const PostDetailDtoSchema = PostDetailBaseSchema.extend({
	imageUrls: z.object({
		imageInfos: z.array(PostImageInfoDtoSchema),
	}),
});

const PostDetailResponseApiSchema = PostDetailBaseSchema.extend({
	imageUrls: z.object({
		imageInfos: z.array(PostImageInfoDtoSchema),
	}),
});

const emojiRegex = /[\p{Extended_Pictographic}]/u;
const titleSchema = z
	.string()
	.trim()
	.min(2, postValidationMessages.titleRequired)
	.max(50, postValidationMessages.titleMax)
	.refine((value) => !emojiRegex.test(value), postValidationMessages.titleNoEmoji);

const contentSchema = z
	.string()
	.trim()
	.min(1, postValidationMessages.contentRequired)
	.max(2000, postValidationMessages.contentMax)
	.refine((value) => !emojiRegex.test(value), postValidationMessages.contentNoEmoji);

const rentalFeeSchema = z
	.number()
	.min(0, postValidationMessages.rentalFeeMin)
	.max(100000000, postValidationMessages.rentalFeeMax);
// .nullable();

const postImageUrlSchema = z.string().min(1, postValidationMessages.imageUrlInvalid);

const PostCreateSchema = z.object({
	title: titleSchema,
	content: contentSchema,
	imageUrls: z.array(postImageUrlSchema).min(1, postValidationMessages.imagesRequired),
	rentalFee: rentalFeeSchema,
	feeUnit: feeUnitSchema,
});

const PostUpdateImageInfoSchema = z.object({
	postImageId: z.number().nullable().optional(),
	imageUrl: postImageUrlSchema,
});

const PostUpdateSchema = z.object({
	title: titleSchema,
	content: contentSchema,
	imageUrls: z.object({
		imageInfos: z.array(PostUpdateImageInfoSchema).min(1, postValidationMessages.imagesRequired),
	}),
	rentalFee: rentalFeeSchema,
	feeUnit: feeUnitSchema,
});

const PostEditorSchema = PostCreateSchema.pick({
	title: true,
	content: true,
	rentalFee: true,
	feeUnit: true,
});

type PostEditorValues = z.infer<typeof PostEditorSchema>;

type FeeUnit = z.infer<typeof feeUnitSchema>;
type RentalStatus = z.infer<typeof rentalStatusSchema>;
type PostSummaryDto = z.infer<typeof PostSummaryDtoSchema>;
type PostSummariesResponseDto = z.infer<typeof PostSummariesResponseDtoSchema>;
type PostDetailDto = z.infer<typeof PostDetailDtoSchema>;

export type {
	FeeUnit,
	PostDetailDto,
	PostEditorValues,
	PostSummariesResponseDto,
	PostSummaryDto,
	RentalStatus,
};

export {
	feeUnitSchema,
	PostCreateSchema,
	PostDetailDtoSchema,
	PostDetailResponseApiSchema,
	PostEditorSchema,
	PostImageInfoDtoSchema,
	PostSummariesResponseApiSchema,
	PostSummariesResponseDtoSchema,
	PostSummaryDtoSchema,
	PostUpdateImageInfoSchema,
	PostUpdateSchema,
	rentalStatusSchema,
};
