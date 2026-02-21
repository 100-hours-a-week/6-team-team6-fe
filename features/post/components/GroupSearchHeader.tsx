"use client";

import { type ChangeEvent, type FormEvent } from "react";

import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { InputField } from "@/shared/components/ui/input-field";

interface GroupSearchHeaderProps {
	keyword: string;
	isSearchEnabled: boolean;
	onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function GroupSearchHeader(props: GroupSearchHeaderProps) {
	const { keyword, onKeywordChange, onSubmit } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={
				<form id="search-form" className="w-full px-2" onSubmit={onSubmit}>
					<InputField
						variant="search"
						clearable
						value={keyword}
						onChange={onKeywordChange}
						placeholder="관심있는 물품을 검색하세요"
						aria-label="검색어 입력"
						autoFocus
					/>
				</form>
			}
			right={null}
		/>
	);
}
