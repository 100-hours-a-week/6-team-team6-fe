import { notFound, redirect } from "next/navigation";

import { getMyGroupMembershipServer } from "@/features/group/api/getMyGroupMembershipServer";
import {
	isGroupMembershipForbiddenError,
	isGroupNotFoundError,
} from "@/features/group/lib/groupAccessGuards";
import { groupRoutes } from "@/features/group/lib/groupRoutes";

import { isErrorWithStatus } from "@/shared/lib/api/error-guards";
import StatusCodes from "@/shared/lib/api/status-codes";
import { isNumericPathParam } from "@/shared/lib/path-params";

interface GroupAccessGuardLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		groupId: string;
	}>;
}

async function GroupAccessGuardLayout(props: GroupAccessGuardLayoutProps) {
	const { children, params } = props;
	const { groupId } = await params;

	if (!isNumericPathParam(groupId)) {
		notFound();
	}

	try {
		await getMyGroupMembershipServer(groupId);
	} catch (error) {
		if (isGroupNotFoundError(error)) {
			notFound();
		}

		if (isGroupMembershipForbiddenError(error)) {
			redirect(groupRoutes.list());
		}

		if (isErrorWithStatus(error, StatusCodes.UNAUTHORIZED)) {
			redirect("/login");
		}

		throw error;
	}

	return <>{children}</>;
}

export default GroupAccessGuardLayout;
