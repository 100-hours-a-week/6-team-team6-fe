import type { FeeUnit, RentalStatus } from "@/features/post/schemas";

import type { SelectOption } from "@/shared/components/ui/select-field";

export const rentalStatusLabels: Record<RentalStatus, string> = {
	AVAILABLE: "대여 가능",
	RENTED_OUT: "대여중",
};

export const rentalStatusOptions: SelectOption[] = [
	{ value: "AVAILABLE", label: rentalStatusLabels.AVAILABLE },
	{ value: "RENTED_OUT", label: rentalStatusLabels.RENTED_OUT },
];

export const rentalFeeUnitLabels: Record<FeeUnit, string> = {
	HOUR: "시간",
	DAY: "일",
};

export const rentalFeeUnitOptions: SelectOption[] = [
	{ value: "HOUR", label: rentalFeeUnitLabels.HOUR },
	{ value: "DAY", label: rentalFeeUnitLabels.DAY },
];
