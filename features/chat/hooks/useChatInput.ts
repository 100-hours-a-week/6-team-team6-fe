import { useCallback, useState } from "react";

interface UseChatInputProps {
	onSubmit: (text: string) => void;
}

export function useChatInput(props: UseChatInputProps) {
	const { onSubmit } = props;

	const [value, setValue] = useState("");

	const submitValue = useCallback(() => {
		const trimmed = value.trim();
		if (!trimmed) {
			return;
		}
		onSubmit(trimmed);
		setValue("");
	}, [onSubmit, value]);

	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			submitValue();
		},
		[submitValue],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key !== "Enter" || event.shiftKey) {
				return;
			}
			event.preventDefault();
			submitValue();
		},
		[submitValue],
	);

	const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
	}, []);

	return {
		value,
		handleChange,
		handleKeyDown,
		handleSubmit,
	};
}
