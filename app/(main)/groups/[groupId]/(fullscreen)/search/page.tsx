"use client";

import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import PostItem from "@/features/post/components/PostItem";
import { DUMMY_POSTS } from "@/features/post/constants";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Typography } from "@/shared/components/ui/typography";

const RECENT_SEARCH_STORAGE_KEY = "billage.recent-searches";
const MAX_RECENT_SEARCHES = 10;

function SearchPage() {
	const params = useParams<{ groupId: string }>();
	const groupId = params.groupId ?? "";
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsKeyword = searchParams?.get("keyword") ?? "";
	const initialKeyword = searchParamsKeyword;
	const [keyword, setKeyword] = useState(initialKeyword);
	const [submittedKeyword, setSubmittedKeyword] = useState(initialKeyword);
	const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

	useEffect(() => {
		if (!searchParamsKeyword) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setKeyword("");
			setSubmittedKeyword("");
			return;
		}
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
				// eslint-disable-next-line react-hooks/set-state-in-effect
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
			if (!nextValue) {
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

	const isSearchEnabled = keyword.trim().length > 0;
	const normalizedKeyword = submittedKeyword.trim().toLowerCase();
	const trimmedKeyword = keyword.trim();
	const shouldShowRecentKeywords = trimmedKeyword.length === 0;
	const shouldShowResults = normalizedKeyword.length > 0;

	const searchResults = useMemo(() => {
		if (!normalizedKeyword) {
			return [];
		}
		return DUMMY_POSTS.filter((post) => post.title.toLowerCase().includes(normalizedKeyword));
	}, [normalizedKeyword]);

	return (
		<>
			<header className="h-10 px-2 sticky top-0 grid grid-cols-[auto_1fr_auto] place-items-center items-center border-b border-gray-200 bg-white z-(--z-header)">
				<div className="justify-self-start">
					<BackButton />
				</div>
				<div className="justify-self-center w-full flex items-center">
					<form id="search-form" className="w-full px-2" onSubmit={handleSubmit}>
						<Input
							value={keyword}
							onChange={handleKeywordChange}
							placeholder="관심있는 물품을 검색하세요"
							aria-label="검색어 입력"
						/>
					</form>
				</div>
				<div className="justify-self-end">
					<Button form="search-form" type="submit" variant="default" disabled={!isSearchEnabled}>
						검색
					</Button>
				</div>
			</header>

			<HorizontalPaddingBox className="py-6">
				{shouldShowRecentKeywords ? (
					<div className="flex flex-col gap-4">
						<Typography type="subtitle">최근 검색어</Typography>
						{recentKeywords.length > 0 ? (
							<ul className="flex flex-col gap-2">
								{recentKeywords.map((item) => (
									<li key={item}>
										<button type="button" onClick={() => handleSearch(item)} className="text-left">
											<Typography type="body-sm">{item}</Typography>
										</button>
									</li>
								))}
							</ul>
						) : (
							<Typography type="caption">최근 검색어가 없어요.</Typography>
						)}
					</div>
				) : shouldShowResults ? (
					<div className="flex flex-col gap-4">
						<Typography type="subtitle">검색 결과</Typography>
						{searchResults.length > 0 ? (
							<ul className="flex flex-col gap-6">
								{searchResults.map((post, index) => (
									<li key={post.postId} className="flex flex-col gap-y-6">
										<Link href={`/groups/${groupId}/posts/${post.postId}`}>
											<PostItem {...post} />
										</Link>
										{index !== searchResults.length - 1 && <Separator />}
									</li>
								))}
							</ul>
						) : (
							<Typography type="body-sm" className="text-muted-foreground">
								&apos;{submittedKeyword}&apos;에 대한 검색 결과가 없어요.
							</Typography>
						)}
					</div>
				) : (
					<div className="h-10" aria-hidden="true" />
				)}
			</HorizontalPaddingBox>
		</>
	);
}

export default SearchPage;
