import { useCallback, useState } from "react";

interface UseChatInputProps {
	onSubmit: (text: string) => void;
}

export function useChatInput(props: UseChatInputProps) {
	const { onSubmit } = props;

	const [value, setValue] = useState("");
	const [isComposing, setIsComposing] = useState(false);

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
			if (isComposing || event.nativeEvent.isComposing) {
				return;
			}

			if (event.key !== "Enter" || event.shiftKey) {
				return;
			}
			event.preventDefault();
			submitValue();
		},
		[isComposing, submitValue],
	);

	const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
	}, []);

	const handleCompositionStart = useCallback(() => {
		setIsComposing(true);
	}, []);

	const handleCompositionEnd = useCallback(() => {
		setIsComposing(false);
	}, []);

	return {
		value,
		handleChange,
		handleKeyDown,
		handleSubmit,
		handleCompositionStart,
		handleCompositionEnd,
	};
}
