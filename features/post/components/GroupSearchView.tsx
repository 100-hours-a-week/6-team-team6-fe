"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useCallback } from "react";

import Link from "next/link";

import { GroupSearchHeader } from "@/features/post/components/GroupSearchHeader";
import PostItem from "@/features/post/components/PostItem";
import { PostItemSkeletonList } from "@/features/post/components/PostItemSkeletonList";
import { postRoutes } from "@/features/post/lib/postRoutes";
import type { PostSummaryDto } from "@/features/post/schemas";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography, type TypographyType } from "@/shared/components/ui/typography";

import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
interface GroupSearchViewProps {
	groupId: string;
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

const emptySpacer = <div className="h-10" aria-hidden="true" />;
const SEARCH_RESULTS_ERROR_LABEL = "검색 결과를 불러오지 못했습니다.";
const SEARCH_RESULTS_LOADING_MORE_LABEL = "검색 결과를 더 불러오는 중";
const SEARCH_RESULTS_SKELETON_COUNT = 20;

export function GroupSearchView(props: GroupSearchViewProps) {
	const {
		groupId,
		keyword,
		submittedKeyword,
		recentKeywords,
		searchResults,
		isSearchEnabled,
		shouldShowRecentKeywords,
		shouldShowResults,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		onLoadMore,
		onKeywordChange,
		onSubmit,
		onSearch,
	} = props;

	const content = shouldShowRecentKeywords ? (
		<RecentKeywordsSection recentKeywords={recentKeywords} onSearch={onSearch} />
	) : shouldShowResults ? (
		<SearchResultsSection
			groupId={groupId}
			submittedKeyword={submittedKeyword}
			searchResults={searchResults}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			onLoadMore={onLoadMore}
		/>
	) : (
		emptySpacer
	);

	return (
		<>
			<GroupSearchHeader
				keyword={keyword}
				isSearchEnabled={isSearchEnabled}
				onKeywordChange={onKeywordChange}
				onSubmit={onSubmit}
			/>

			<div className="py-6">{content}</div>
		</>
	);
}

interface RecentKeywordsSectionProps {
	recentKeywords: string[];
	onSearch: (value?: string) => void;
}

function RecentKeywordsSection(props: RecentKeywordsSectionProps) {
	const { recentKeywords, onSearch } = props;
	const hasRecentKeywords = recentKeywords.length > 0;

	return (
		<HorizontalPaddingBox>
			<div className="flex flex-col gap-4">
				<Typography type="subtitle">최근 검색어</Typography>
				{hasRecentKeywords ? (
					<ul className="flex flex-col gap-2">
						{recentKeywords.map((item) => (
							<li key={item}>
								<button type="button" onClick={() => onSearch(item)} className="text-left">
									<Typography type="body-sm">{item}</Typography>
								</button>
							</li>
						))}
					</ul>
				) : (
					<Typography type="caption">최근 검색어가 없어요.</Typography>
				)}
			</div>
		</HorizontalPaddingBox>
	);
}

interface SearchResultsSectionProps {
	groupId: string;
	submittedKeyword: string;
	searchResults: PostSummaryDto[];
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
}

function SearchResultsSection(props: SearchResultsSectionProps) {
	const {
		groupId,
		submittedKeyword,
		searchResults,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage,
		onLoadMore,
	} = props;
	const hasSearchResults = searchResults.length > 0;
	const isLoadingInitial = isLoading && !hasSearchResults;
	const handleIntersect = useCallback(() => {
		if (!hasNextPage || isFetchingNextPage) {
			return;
		}
		onLoadMore();
	}, [hasNextPage, isFetchingNextPage, onLoadMore]);

	const { setTarget } = useIntersectionObserver({
		onIntersect: handleIntersect,
		enabled: hasNextPage,
		rootMargin: "0px 0px 200px 0px",
	});

	if (isLoadingInitial) {
		return (
			<div className="flex flex-col gap-4">
				<SectionTitle>검색 결과</SectionTitle>
				<PostItemSkeletonList count={SEARCH_RESULTS_SKELETON_COUNT} />
			</div>
		);
	}

	if (isError && !hasSearchResults) {
		return (
			<div className="flex flex-col gap-4">
				<SectionTitle>검색 결과</SectionTitle>
				<SectionMessage type="body-sm" className="text-muted-foreground">
					{SEARCH_RESULTS_ERROR_LABEL}
				</SectionMessage>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<SectionTitle>검색 결과</SectionTitle>
			{hasSearchResults ? (
				<>
					<SearchResultsList groupId={groupId} searchResults={searchResults} />
					{hasNextPage ? (
						isFetchingNextPage ? (
							<PostItemSkeletonList count={SEARCH_RESULTS_SKELETON_COUNT} />
						) : (
							<HorizontalPaddingBox>
								<div
									ref={setTarget}
									className="flex items-center justify-center gap-2 py-4 text-muted-foreground"
								>
									<Spinner />
									<Typography type="body-sm">{SEARCH_RESULTS_LOADING_MORE_LABEL}</Typography>
								</div>
							</HorizontalPaddingBox>
						)
					) : null}
				</>
			) : (
				<SectionMessage type="body-sm" className="text-muted-foreground">
					{`'${submittedKeyword}'`}에 대한 검색 결과가 없어요.
				</SectionMessage>
			)}
		</div>
	);
}

interface SearchResultsListProps {
	groupId: string;
	searchResults: PostSummaryDto[];
}

function SearchResultsList(props: SearchResultsListProps) {
	const { groupId, searchResults } = props;

	return (
		<ul className="flex flex-col gap-6">
			{searchResults.map((post, index) => (
				<li key={post.postId} className="flex flex-col gap-y-6">
					<HorizontalPaddingBox>
						<Link href={postRoutes.postDetail(groupId, post.postId)}>
							<PostItem {...post} />
						</Link>
					</HorizontalPaddingBox>
					{index !== searchResults.length - 1 && <Separator />}
				</li>
			))}
		</ul>
	);
}

interface SectionTitleProps {
	children: ReactNode;
}

function SectionTitle(props: SectionTitleProps) {
	const { children } = props;

	return (
		<HorizontalPaddingBox>
			<Typography type="subtitle">{children}</Typography>
		</HorizontalPaddingBox>
	);
}

interface SectionMessageProps {
	children: ReactNode;
	type: TypographyType;
	className?: string;
}

function SectionMessage(props: SectionMessageProps) {
	const { children, type, className } = props;

	return (
		<HorizontalPaddingBox>
			<Typography type={type} className={className}>
				{children}
			</Typography>
		</HorizontalPaddingBox>
	);
}
