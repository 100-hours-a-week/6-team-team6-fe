import { z } from "zod";

const GROUP_NAME_REGEX = /^[가-힣A-Za-z0-9]+$/;
const GROUP_NAME_MIN_LENGTH = 2;
const GROUP_NAME_MAX_LENGTH = 30;

const GroupCreateFormSchema = z.object({
	groupName: z
		.string()
		.trim()
		.min(GROUP_NAME_MIN_LENGTH, "그룹 이름을 2자 이상 입력해주세요.")
		.max(GROUP_NAME_MAX_LENGTH, "그룹 이름은 30자 이하로 입력해주세요.")
		.regex(GROUP_NAME_REGEX, "그룹 이름은 한글, 영문, 숫자만 사용할 수 있어요."),
});

const GroupCreateResponseApiSchema = z.object({
	groupId: z.number().int(),
});

const GroupCreateResponseDtoSchema = z.object({
	groupId: z.number().int(),
});

const GroupSummaryDtoSchema = z.object({
	groupId: z.number(),
	groupName: z.string().min(1),
	groupCoverImageUrl: z.string().nullable().optional(),
});

const GroupSummariesSchema = z.array(GroupSummaryDtoSchema);

const MyGroupsResponseApiSchema = z.object({
	totalCount: z.number().int().min(0),
	groupSummaries: GroupSummariesSchema,
});

const MyGroupsResponseDtoSchema = z.object({
	totalCount: z.number().int().min(0),
	groups: GroupSummariesSchema,
});

const MyPostSummaryBaseSchema = z.object({
	groupId: z.number().int().nullable().optional(),
	postId: z.number().int(),
	postTitle: z.string().min(1),
	postImageId: z.number().int(),
	postFirstImageUrl: z.string().nullable().optional(),
});

const MyPostSummaryDtoSchema = z.object({
	groupId: z.number().int().nullable(),
	postId: z.number().int(),
	postTitle: z.string().min(1),
	postImageId: z.number().int(),
	postFirstImageUrl: z.string().nullable(),
});

const MyPostSummariesResponseApiSchema = z.object({
	myPostSummaries: z.array(MyPostSummaryBaseSchema),
	nextCursor: z.string().nullable(),
	hasNext: z.boolean(),
});

const MyPostSummariesResponseDtoSchema = z.object({
	summaries: z.array(MyPostSummaryDtoSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

type GroupSummaryDto = z.infer<typeof GroupSummaryDtoSchema>;
type GroupCreateFormValues = z.infer<typeof GroupCreateFormSchema>;
type GroupCreateResponseDto = z.infer<typeof GroupCreateResponseDtoSchema>;
type MyGroupsResponseDto = z.infer<typeof MyGroupsResponseDtoSchema>;
type MyPostSummaryDto = z.infer<typeof MyPostSummaryDtoSchema>;
type MyPostSummariesResponseDto = z.infer<typeof MyPostSummariesResponseDtoSchema>;

export type {
	GroupCreateFormValues,
	GroupCreateResponseDto,
	GroupSummaryDto,
	MyGroupsResponseDto,
	MyPostSummariesResponseDto,
	MyPostSummaryDto,
};

export {
	GroupCreateFormSchema,
	GroupCreateResponseApiSchema,
	GroupCreateResponseDtoSchema,
	GroupSummaryDtoSchema,
	MyGroupsResponseApiSchema,
	MyGroupsResponseDtoSchema,
	MyPostSummariesResponseApiSchema,
	MyPostSummariesResponseDtoSchema,
	MyPostSummaryDtoSchema,
};
