"use client";

import { useQuery } from "@tanstack/react-query";

import { authQueryKeys } from "@/features/auth/api/authQueries";
import type { GetMyProfileError } from "@/features/auth/api/getMyProfile";
import { getMyProfile } from "@/features/auth/api/getMyProfile";
import type { MyProfileResponseDto } from "@/features/auth/schemas";

function useMyProfile(enabled = true) {
	return useQuery<MyProfileResponseDto, GetMyProfileError>({
		queryKey: authQueryKeys.me(),
		queryFn: () => getMyProfile(),
		enabled,
	});
}

export type { MyProfileResponseDto };
export default useMyProfile;
