import type { ChatMessages } from "@/features/chat/types";

export const createTimestamp = (minutesAgo: number) =>
	new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

export function formatMessageTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("ko-KR", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

function getMinuteKey(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}

export function shouldShowTime(index: number, messages: ChatMessages) {
	if (index >= messages.length - 1) {
		return true;
	}

	return getMinuteKey(messages[index].createdAt) !== getMinuteKey(messages[index + 1].createdAt);
}
