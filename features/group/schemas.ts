import { z } from "zod";

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
type MyGroupsResponseDto = z.infer<typeof MyGroupsResponseDtoSchema>;
type MyPostSummaryDto = z.infer<typeof MyPostSummaryDtoSchema>;
type MyPostSummariesResponseDto = z.infer<typeof MyPostSummariesResponseDtoSchema>;

export type { GroupSummaryDto, MyGroupsResponseDto, MyPostSummariesResponseDto, MyPostSummaryDto };

export {
	GroupSummaryDtoSchema,
	MyGroupsResponseApiSchema,
	MyGroupsResponseDtoSchema,
	MyPostSummariesResponseApiSchema,
	MyPostSummariesResponseDtoSchema,
	MyPostSummaryDtoSchema,
};
