"use client";

import { type ChangeEvent, type FormEvent, type ReactNode } from "react";

import Link from "next/link";

import { GroupSearchHeader } from "@/features/post/components/GroupSearchHeader";
import PostItem from "@/features/post/components/PostItem";
import { type Post } from "@/features/post/schemas";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Separator } from "@/shared/components/ui/separator";
import { Typography, type TypographyType } from "@/shared/components/ui/typography";

interface GroupSearchViewProps {
	groupId: string;
	keyword: string;
	submittedKeyword: string;
	recentKeywords: string[];
	searchResults: Post[];
	isSearchEnabled: boolean;
	shouldShowRecentKeywords: boolean;
	shouldShowResults: boolean;
	onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onSearch: (value?: string) => void;
}

const emptySpacer = <div className="h-10" aria-hidden="true" />;

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
	searchResults: Post[];
}

function SearchResultsSection(props: SearchResultsSectionProps) {
	const { groupId, submittedKeyword, searchResults } = props;
	const hasSearchResults = searchResults.length > 0;

	return (
		<div className="flex flex-col gap-4">
			<SectionTitle>검색 결과</SectionTitle>
			{hasSearchResults ? (
				<SearchResultsList groupId={groupId} searchResults={searchResults} />
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
	searchResults: Post[];
}

function SearchResultsList(props: SearchResultsListProps) {
	const { groupId, searchResults } = props;

	return (
		<ul className="flex flex-col gap-6">
			{searchResults.map((post, index) => (
				<li key={post.postId} className="flex flex-col gap-y-6">
					<HorizontalPaddingBox>
						<Link href={`/groups/${groupId}/posts/${post.postId}`}>
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
