import { z } from "zod";

import {
	GROUP_INVITE_NICKNAME_LENGTH_ERROR,
	GROUP_INVITE_NICKNAME_MAX_LENGTH,
	GROUP_INVITE_NICKNAME_MIN_LENGTH,
} from "@/features/group/lib/groupInvite";

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

const GroupSettingsResponseApiSchema = z.object({
	groupId: z.number().int(),
	groupName: z.string().min(1),
	groupCoverImageUrl: z.string().nullable().optional(),
});

const GroupSettingsResponseDtoSchema = z.object({
	groupId: z.number().int(),
	groupName: z.string().min(1),
	groupCoverImageUrl: z.string().nullable(),
});

const GroupMembershipMeResponseApiSchema = z.object({
	membershipId: z.number().int(),
	nickname: z.string().min(1),
});

const GroupMembershipMeResponseDtoSchema = z.object({
	membershipId: z.number().int(),
	nickname: z.string().min(1),
});

const GroupMembershipNicknameUpdateResponseApiSchema = z.object({
	nickname: z.string().min(1),
});

const GroupMembershipNicknameUpdateResponseDtoSchema = z.object({
	nickname: z.string().min(1),
});

const GroupInvitationCreateResponseApiSchema = z.object({
	invitationToken: z.string().min(1),
});

const GroupInvitationCreateResponseDtoSchema = z.object({
	invitationToken: z.string().min(1),
});

const GroupInvitationValidateResponseApiSchema = z.object({
	groupId: z.number().int(),
	groupName: z.string().min(1),
	groupCoverImageUrl: z.string().nullable().optional(),
});

const GroupInvitationValidateResponseDtoSchema = z.object({
	groupId: z.number().int(),
	groupName: z.string().min(1),
	groupCoverImageUrl: z.string().nullable(),
});

const GroupInvitationJoinRequestSchema = z.object({
	nickname: z
		.string()
		.min(GROUP_INVITE_NICKNAME_MIN_LENGTH, GROUP_INVITE_NICKNAME_LENGTH_ERROR)
		.max(GROUP_INVITE_NICKNAME_MAX_LENGTH, GROUP_INVITE_NICKNAME_LENGTH_ERROR)
		.regex(/^\S+$/, GROUP_INVITE_NICKNAME_LENGTH_ERROR),
});

const GroupInvitationJoinResponseApiSchema = z.object({
	membershipId: z.number().int(),
});

const GroupInvitationJoinResponseDtoSchema = z.object({
	membershipId: z.number().int(),
});

const GroupInvitationJoinFormSchema = GroupInvitationJoinRequestSchema;

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

const MyPostSummaryApiSchema = z.object({
	groupId: z.number().int().nullable().optional(),
	postId: z.number().int(),
	postTitle: z.string().min(1),
	postImageId: z.number().int(),
	postFirstImageUrl: z.string().nullable().optional(),
	updatedAt: z.string().min(1).optional(),
});

const MyPostSummaryDtoSchema = z.object({
	postId: z.number().int(),
	postTitle: z.string().min(1),
	postImageId: z.number().int(),
	postFirstImageUrl: z.string().nullable(),
	updatedAt: z.string().nullable(),
	groupId: z.number().int().nullable(),
});

const MyPostSummariesResponseApiSchema = z.object({
	summaries: z.array(MyPostSummaryApiSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

const MyPostSummariesResponseDtoSchema = z.object({
	summaries: z.array(MyPostSummaryDtoSchema),
	nextCursor: z.string().nullable(),
	hasNextPage: z.boolean(),
});

type GroupSummaryDto = z.infer<typeof GroupSummaryDtoSchema>;
type GroupCreateFormValues = z.infer<typeof GroupCreateFormSchema>;
type GroupCreateResponseDto = z.infer<typeof GroupCreateResponseDtoSchema>;
type GroupSettingsDto = z.infer<typeof GroupSettingsResponseDtoSchema>;
type GroupMembershipMeDto = z.infer<typeof GroupMembershipMeResponseDtoSchema>;
type GroupMembershipNicknameUpdateDto = z.infer<
	typeof GroupMembershipNicknameUpdateResponseDtoSchema
>;
type GroupInvitationCreateDto = z.infer<typeof GroupInvitationCreateResponseDtoSchema>;
type GroupInvitationJoinDto = z.infer<typeof GroupInvitationJoinResponseDtoSchema>;
type GroupInvitationJoinFormValues = z.infer<typeof GroupInvitationJoinFormSchema>;
type GroupInvitationValidateDto = z.infer<typeof GroupInvitationValidateResponseDtoSchema>;
type MyGroupsResponseDto = z.infer<typeof MyGroupsResponseDtoSchema>;
type MyPostSummaryDto = z.infer<typeof MyPostSummaryDtoSchema>;
type MyPostSummariesResponseDto = z.infer<typeof MyPostSummariesResponseDtoSchema>;

export type {
	GroupCreateFormValues,
	GroupCreateResponseDto,
	GroupInvitationCreateDto,
	GroupInvitationJoinDto,
	GroupInvitationJoinFormValues,
	GroupInvitationValidateDto,
	GroupMembershipMeDto,
	GroupMembershipNicknameUpdateDto,
	GroupSettingsDto,
	GroupSummaryDto,
	MyGroupsResponseDto,
	MyPostSummariesResponseDto,
	MyPostSummaryDto,
};

export {
	GroupCreateFormSchema,
	GroupCreateResponseApiSchema,
	GroupCreateResponseDtoSchema,
	GroupInvitationCreateResponseApiSchema,
	GroupInvitationCreateResponseDtoSchema,
	GroupInvitationJoinFormSchema,
	GroupInvitationJoinRequestSchema,
	GroupInvitationJoinResponseApiSchema,
	GroupInvitationJoinResponseDtoSchema,
	GroupInvitationValidateResponseApiSchema,
	GroupInvitationValidateResponseDtoSchema,
	GroupMembershipMeResponseApiSchema,
	GroupMembershipMeResponseDtoSchema,
	GroupMembershipNicknameUpdateResponseApiSchema,
	GroupMembershipNicknameUpdateResponseDtoSchema,
	GroupSettingsResponseApiSchema,
	GroupSettingsResponseDtoSchema,
	GroupSummaryDtoSchema,
	MyGroupsResponseApiSchema,
	MyGroupsResponseDtoSchema,
	MyPostSummariesResponseApiSchema,
	MyPostSummariesResponseDtoSchema,
	MyPostSummaryDtoSchema,
};
