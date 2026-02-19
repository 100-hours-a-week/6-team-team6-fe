import { GroupApiError } from "@/features/group/api/groupApiError";
import type { MyGroupsResponseDto } from "@/features/group/schemas";
import {
	MyGroupsResponseApiSchema,
	MyGroupsResponseDtoSchema,
} from "@/features/group/schemas";

import { apiServer } from "@/shared/lib/api/api-server";
import { requestJson } from "@/shared/lib/api/request";

class MyGroupsServerError extends GroupApiError {
	constructor(status: number, code?: string) {
		super("MyGroupsServerError", status, code);
	}
}

async function getMyGroupsServer(): Promise<MyGroupsResponseDto> {
	const parsed = await requestJson(
		apiServer.get("users/me/groups", {
			throwHttpErrors: false,
			cache: "no-store",
		}),
		MyGroupsResponseApiSchema,
		MyGroupsServerError,
	);

	return MyGroupsResponseDtoSchema.parse({
		totalCount: parsed.totalCount,
		groups: parsed.groupSummaries,
	});
}

export { getMyGroupsServer, MyGroupsServerError };
