const rentalFeeFormatter = new Intl.NumberFormat("ko-KR");

const FEE_UNIT_LABELS = {
	HOUR: "시간",
	DAY: "일",
} as const;

type FeeUnit = keyof typeof FEE_UNIT_LABELS;

export function formatRentalFeeLabel(rentalFee: number, feeUnit: FeeUnit) {
	if (rentalFee === 0) {
		return "무료 대여";
	}

	return `${rentalFeeFormatter.format(rentalFee)}원 / ${FEE_UNIT_LABELS[feeUnit]}`;
}

function toDate(value: string | Date) {
	return value instanceof Date ? value : new Date(value);
}

function isInvalidDate(date: Date) {
	return Number.isNaN(date.getTime());
}

function padTwoDigits(value: number) {
	return value.toString().padStart(2, "0");
}

export function formatKoreanDateYMD(value: string | Date) {
	const date = toDate(value);
	if (isInvalidDate(date)) {
		return typeof value === "string" ? value : "";
	}

	const year = date.getFullYear();
	const month = padTwoDigits(date.getMonth() + 1);
	const day = padTwoDigits(date.getDate());

	return `${year}년 ${month}월 ${day}일`;
}

export function formatRelativeTimeLabel(value: string | Date) {
	const date = toDate(value);
	if (isInvalidDate(date)) {
		return typeof value === "string" ? value : "";
	}

	const diffMs = Math.max(0, Date.now() - date.getTime());
	const seconds = Math.floor(diffMs / 1000);
	if (seconds < 60) {
		return "방금 전";
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}분 전`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}시간 전`;
	}

	const days = Math.floor(hours / 24);
	if (days < 31) {
		return `${days}일 전`;
	}

	const months = Math.floor(days / 30);
	if (months < 13) {
		return `${months}개월 전`;
	}

	const years = Math.min(Math.floor(months / 12), 999);
	return `${years}년 전`;
}

export function formatKoreanTime(value: string | Date) {
	const date = toDate(value);
	if (isInvalidDate(date)) {
		return typeof value === "string" ? value : "";
	}

	const hours = date.getHours();
	const periodLabel = hours < 12 ? "오전" : "오후";
	const displayHour = hours % 12 === 0 ? 12 : hours % 12;
	const minutes = padTwoDigits(date.getMinutes());

	return `${periodLabel} ${displayHour}:${minutes}`;
}
