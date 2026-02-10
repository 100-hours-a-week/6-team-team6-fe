"use client";

import { rentalStatusOptions } from "@/features/post/lib/postLabels";
import type { RentalStatus } from "@/features/post/schemas";

import { Badge } from "@/shared/components/ui/badge";
import { SelectField, type SelectOption } from "@/shared/components/ui/select-field";
import { Typography } from "@/shared/components/ui/typography";

const rentalStatusSelectOptions: SelectOption[] = rentalStatusOptions.map((option) => ({
	...option,
	label: <Typography>{option.label}</Typography>,
}));

interface PostDetailMetaProps {
	title: string;
	rentalFeeLabel: string;
	displayDate: string;
	isSeller: boolean;
	isAvailable: boolean;
	rentalStatusValue: RentalStatus;
	isUpdatingStatus: boolean;
	onStatusChange: (value: string) => void;
}

function PostDetailMeta(props: PostDetailMetaProps) {
	const {
		title,
		rentalFeeLabel,
		displayDate,
		isSeller,
		isAvailable,
		rentalStatusValue,
		isUpdatingStatus,
		onStatusChange,
	} = props;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Typography type="title">{title}</Typography>
				{!isSeller && !isAvailable && <Badge>대여중</Badge>}
			</div>
			<div className="flex items-center justify-between">
				<Typography type="title" className="text-xl">
					{rentalFeeLabel}
				</Typography>
				{isSeller && (
					<SelectField
						value={rentalStatusValue}
						options={rentalStatusSelectOptions}
						onValueChange={onStatusChange}
						ariaLabel="대여 상태"
						size="sm"
						disabled={isUpdatingStatus}
					/>
				)}
			</div>
			<div>{displayDate}</div>
		</div>
	);
}

export { PostDetailMeta };
export type { PostDetailMetaProps };
