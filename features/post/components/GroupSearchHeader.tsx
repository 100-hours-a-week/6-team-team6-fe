"use client";

import { type ChangeEvent, type FormEvent } from "react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface GroupSearchHeaderProps {
	keyword: string;
	isSearchEnabled: boolean;
	onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function GroupSearchHeader(props: GroupSearchHeaderProps) {
	const { keyword, isSearchEnabled, onKeywordChange, onSubmit } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={
				<form id="search-form" className="w-full px-2" onSubmit={onSubmit}>
					<Input
						value={keyword}
						onChange={onKeywordChange}
						placeholder="관심있는 물품을 검색하세요"
						aria-label="검색어 입력"
					/>
				</form>
			}
			right={
				<Button form="search-form" type="submit" variant="default" disabled={!isSearchEnabled}>
					검색
				</Button>
			}
		/>
	);
}
