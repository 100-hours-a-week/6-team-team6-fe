"use client";

import { useQuery } from "@tanstack/react-query";

import { type PostRecommendationsError } from "@/features/post/api/getPostRecommendations";
import { postQueries } from "@/features/post/api/postQueries";
import type { PostRecommendationDto } from "@/features/post/schemas";

interface UsePostRecommendationsQueryResult {
	recommendations: PostRecommendationDto[];
	isLoading: boolean;
	isError: boolean;
	error: PostRecommendationsError | null;
}

function usePostRecommendations(postId: string): UsePostRecommendationsQueryResult {
	const recommendationsQuery = useQuery(postQueries.recommendations({ postId }));
	const { data, isLoading, isError, error } = recommendationsQuery;

	return {
		recommendations: data?.recommendations ?? [],
		isLoading,
		isError,
		error,
	};
}

export type { UsePostRecommendationsQueryResult };
export default usePostRecommendations;
