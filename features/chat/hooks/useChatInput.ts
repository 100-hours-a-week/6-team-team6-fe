import { useCallback, useState } from "react";

interface UseChatInputProps {
	onSubmit: (text: string) => void;
	disabled?: boolean;
}

export function useChatInput(props: UseChatInputProps) {
	const { onSubmit, disabled = false } = props;

	const [value, setValue] = useState("");
	const [isComposing, setIsComposing] = useState(false);

	const submitValue = useCallback(() => {
		if (disabled) {
			return;
		}
		const trimmed = value.trim();
		if (!trimmed) {
			return;
		}
		onSubmit(trimmed);
		setValue("");
	}, [disabled, onSubmit, value]);

	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			submitValue();
		},
		[submitValue],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (disabled) {
				return;
			}
			if (isComposing || event.nativeEvent.isComposing) {
				return;
			}

			if (event.key !== "Enter" || event.shiftKey) {
				return;
			}
			event.preventDefault();
			submitValue();
		},
		[disabled, isComposing, submitValue],
	);

	const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (disabled) {
			return;
		}
		setValue(event.target.value);
	}, [disabled]);

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
