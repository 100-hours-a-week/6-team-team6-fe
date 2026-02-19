import { z } from "zod";

import { GroupApiError } from "@/features/group/api/groupApiError";
import type { GroupInvitationValidateDto } from "@/features/group/schemas";
import {
	GroupInvitationValidateResponseApiSchema,
	GroupInvitationValidateResponseDtoSchema,
} from "@/features/group/schemas";

import { apiServer } from "@/shared/lib/api/api-server";

const GroupInvitationValidateErrorBodySchema = z
	.object({
		code: z.string().optional(),
		errorCode: z.string().optional(),
		groupId: z.number().int().optional(),
		groupName: z.string().optional(),
		groupCoverImageUrl: z.string().nullable().optional(),
	})
	.passthrough();

class ValidateGroupInvitationServerError extends GroupApiError {
	groupId?: number;
	invitation?: GroupInvitationValidateDto;

	constructor(
		status: number,
		code?: string,
		options?: {
			groupId?: number;
			invitation?: GroupInvitationValidateDto;
		},
	) {
		super("ValidateGroupInvitationServerError", status, code);
		this.groupId = options?.groupId;
		this.invitation = options?.invitation;
	}
}

const parseGroupInvitationResponseDto = (
	response: z.infer<typeof GroupInvitationValidateResponseApiSchema>,
) =>
	GroupInvitationValidateResponseDtoSchema.parse({
		groupId: response.groupId,
		groupName: response.groupName,
		groupCoverImageUrl: response.groupCoverImageUrl ?? null,
	});

const safeJson = async (response: Response): Promise<unknown> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

async function validateGroupInvitationServer(
	invitationToken: string,
): Promise<GroupInvitationValidateDto> {
	const response = await apiServer.post(`invitations/${invitationToken}`, {
		throwHttpErrors: false,
	});
	const data = await safeJson(response);

	if (!response.ok) {
		const parsedError = GroupInvitationValidateErrorBodySchema.safeParse(data);
		const code = parsedError.success
			? (parsedError.data.errorCode ?? parsedError.data.code)
			: undefined;
		const parsedInvitation = GroupInvitationValidateResponseApiSchema.safeParse(data);

		throw new ValidateGroupInvitationServerError(response.status, code, {
			groupId: parsedError.success ? parsedError.data.groupId : undefined,
			invitation: parsedInvitation.success
				? parseGroupInvitationResponseDto(parsedInvitation.data)
				: undefined,
		});
	}

	const parsedResponse = GroupInvitationValidateResponseApiSchema.parse(data);
	return parseGroupInvitationResponseDto(parsedResponse);
}

export { validateGroupInvitationServer, ValidateGroupInvitationServerError };
