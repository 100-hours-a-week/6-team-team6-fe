"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { getMyGroups } from "@/features/group/api/getMyGroups";
import { groupQueryKeys } from "@/features/group/api/groupQueryKeys";

function useMyGroups() {
	const query = useQuery({
		queryKey: groupQueryKeys.myGroups(),
		queryFn: getMyGroups,
	});

	const groups = useMemo(() => query.data?.groups ?? [], [query.data]);
	const totalCount = query.data?.totalCount ?? groups.length;

	return {
		groups,
		totalCount,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export { useMyGroups };
