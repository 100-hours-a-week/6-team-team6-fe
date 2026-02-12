"use client";

import {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import { getGroupPosts, type GroupPostsError } from "@/features/post/api/getGroupPosts";
import type { PostSummariesResponseDto, PostSummaryDto } from "@/features/post/schemas";

const RECENT_SEARCH_STORAGE_KEY = "billage.recent-searches";
const MAX_RECENT_SEARCHES = 10;

export interface GroupSearchState {
	keyword: string;
	submittedKeyword: string;
	recentKeywords: string[];
	searchResults: PostSummaryDto[];
	isSearchEnabled: boolean;
	shouldShowRecentKeywords: boolean;
	shouldShowResults: boolean;
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
	onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onSearch: (value?: string) => void;
}

const MIN_SEARCH_KEYWORD_LENGTH = 2;

export function useGroupSearch(groupId: string): GroupSearchState {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsKeyword = searchParams?.get("keyword") ?? "";
	const [keyword, setKeyword] = useState(searchParamsKeyword);
	const [submittedKeyword, setSubmittedKeyword] = useState(searchParamsKeyword);
	const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

	useEffect(() => {
		 
		setKeyword(searchParamsKeyword);
		 
		setSubmittedKeyword(searchParamsKeyword);
	}, [searchParamsKeyword]);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
			if (!stored) {
				return;
			}
			const parsed: unknown = JSON.parse(stored);
			if (Array.isArray(parsed)) {
				const nextRecentKeywords = parsed.filter(
					(item): item is string => typeof item === "string",
				);
				 
				setRecentKeywords(nextRecentKeywords);
			}
		} catch {
			// TODO: handle error
		}
	}, []);

	const persistRecentKeywords = useCallback((items: string[]) => {
		try {
			window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(items));
		} catch {
			// TODO: handle error
		}
	}, []);

	const updateRecentKeywords = useCallback(
		(value: string) => {
			setRecentKeywords((prev) => {
				const next = [value, ...prev.filter((item) => item !== value)].slice(
					0,
					MAX_RECENT_SEARCHES,
				);
				persistRecentKeywords(next);
				return next;
			});
		},
		[persistRecentKeywords],
	);

	const updateKeywordQuery = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams?.toString());
			if (value) {
				params.set("keyword", value);
			} else {
				params.delete("keyword");
			}
			const queryString = params.toString();
			router.replace(queryString ? `${pathname}?${queryString}` : pathname);
		},
		[pathname, router, searchParams],
	);

	const handleSearch = useCallback(
		(value?: string) => {
			const nextValue = (value ?? keyword).trim();
			if (!nextValue || nextValue.length < MIN_SEARCH_KEYWORD_LENGTH) {
				return;
			}
			setKeyword(nextValue);
			setSubmittedKeyword(nextValue);
			updateRecentKeywords(nextValue);
			updateKeywordQuery(nextValue);
		},
		[keyword, updateRecentKeywords, updateKeywordQuery],
	);

	const handleKeywordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const nextValue = event.target.value;
		setKeyword(nextValue);
		setSubmittedKeyword((prev) => {
			if (!prev) {
				return prev;
			}
			const normalizedPrev = prev.trim();
			const normalizedNext = nextValue.trim();
			return normalizedPrev === normalizedNext ? prev : "";
		});
	}, []);

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSearch();
		},
		[handleSearch],
	);

	const trimmedKeyword = keyword.trim();
	const normalizedKeyword = submittedKeyword.trim();
	const isSearchEnabled = trimmedKeyword.length >= MIN_SEARCH_KEYWORD_LENGTH;
	const shouldShowRecentKeywords = trimmedKeyword.length === 0;
	const shouldShowResults = normalizedKeyword.length >= MIN_SEARCH_KEYWORD_LENGTH;

	const searchQuery = useInfiniteQuery<
		PostSummariesResponseDto,
		GroupPostsError,
		InfiniteData<PostSummariesResponseDto, string | undefined>,
		["posts", "group", string, "search", string],
		string | undefined
	>({
		queryKey: ["posts", "group", groupId, "search", normalizedKeyword],
		queryFn: ({ pageParam }) =>
			getGroupPosts({ groupId, query: normalizedKeyword, cursor: pageParam }),
		initialPageParam: undefined,
		getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor : undefined),
		enabled: Boolean(groupId) && normalizedKeyword.length >= MIN_SEARCH_KEYWORD_LENGTH,
	});

	const searchResults = useMemo(() => {
		return searchQuery.data?.pages.flatMap((page) => page.summaries) ?? [];
	}, [searchQuery.data]);
	const { fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading } = searchQuery;

	const loadMore = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}
		fetchNextPage();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return {
		keyword,
		submittedKeyword,
		recentKeywords,
		searchResults,
		isSearchEnabled,
		shouldShowRecentKeywords,
		shouldShowResults,
		isLoading,
		isError,
		hasNextPage: hasNextPage ?? false,
		isFetchingNextPage,
		onLoadMore: loadMore,
		onKeywordChange: handleKeywordChange,
		onSubmit: handleSubmit,
		onSearch: handleSearch,
	};
}
