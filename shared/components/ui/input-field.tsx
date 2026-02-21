"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { CircleXIcon, EyeIcon, EyeOffIcon, SearchIcon } from "lucide-react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/shared/components/ui/input-group";

import { cn } from "@/shared/lib/utils";

const inputFieldVariants = cva("", {
	variants: {
		variant: {
			default: "",
			search:
				"h-11 rounded-full border-transparent bg-muted dark:bg-muted/50 has-disabled:bg-muted/80 dark:has-disabled:bg-muted/40",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const inputFieldInputVariants = cva("", {
	variants: {
		variant: {
			default: "",
			search: "h-11 text-base",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const addonVariants = cva("", {
	variants: {
		variant: {
			default: "",
			search: "",
		},
		position: {
			left: "",
			right: "",
		},
	},
	compoundVariants: [
		{
			variant: "search",
			position: "left",
			className: "pl-3.5",
		},
		{
			variant: "search",
			position: "right",
			className: "pr-1.5",
		},
	],
	defaultVariants: {
		variant: "default",
		position: "left",
	},
});

function getInputValue(value: React.ComponentProps<"input">["value"]) {
	if (value === undefined || value === null) {
		return "";
	}

	if (Array.isArray(value)) {
		return value.join(",");
	}

	return String(value);
}

type InputFieldProps = Omit<React.ComponentProps<"input">, "size"> &
	VariantProps<typeof inputFieldVariants> & {
		leftSlot?: React.ReactNode;
		rightSlot?: React.ReactNode;
		clearable?: boolean;
		clearButtonAriaLabel?: string;
		onClear?: () => void;
		passwordToggle?: boolean;
		showSearchIcon?: boolean;
		groupClassName?: string;
		inputClassName?: string;
	};

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
	{
		variant,
		leftSlot,
		rightSlot,
		clearable = false,
		clearButtonAriaLabel = "입력값 지우기",
		onClear,
		passwordToggle = false,
		showSearchIcon,
		groupClassName,
		inputClassName,
		className,
		type,
		value,
		defaultValue,
		onChange,
		disabled,
		readOnly,
		...props
	},
	forwardedRef,
) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
	const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
		getInputValue(defaultValue),
	);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? getInputValue(value) : uncontrolledValue;

	const effectiveType = type ?? (passwordToggle ? "password" : "text");
	const canTogglePassword = passwordToggle && effectiveType === "password";
	const resolvedType = canTogglePassword && isPasswordVisible ? "text" : effectiveType;

	const shouldShowSearchIcon = showSearchIcon ?? variant === "search";
	const effectiveLeftSlot =
		leftSlot ?? (shouldShowSearchIcon ? <SearchIcon aria-hidden="true" /> : null);
	const shouldShowClearButton = Boolean(
		clearable && currentValue.length > 0 && !disabled && !readOnly,
	);
	const shouldRenderRightAddon = Boolean(rightSlot || shouldShowClearButton || canTogglePassword);

	const setInputRef = React.useCallback(
		(node: HTMLInputElement | null) => {
			inputRef.current = node;

			if (typeof forwardedRef === "function") {
				forwardedRef(node);
				return;
			}

			if (forwardedRef) {
				forwardedRef.current = node;
			}
		},
		[forwardedRef],
	);

	const handleChange = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (!isControlled) {
				setUncontrolledValue(event.target.value);
			}
			onChange?.(event);
		},
		[isControlled, onChange],
	);

	const handleClear = React.useCallback(() => {
		onClear?.();

		if (!inputRef.current || disabled || readOnly) {
			return;
		}

		const setNativeValue = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			"value",
		)?.set;

		setNativeValue?.call(inputRef.current, "");
		inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));

		if (!isControlled) {
			setUncontrolledValue("");
		}

		inputRef.current.focus();
	}, [disabled, isControlled, onClear, readOnly]);

	return (
		<InputGroup className={cn(inputFieldVariants({ variant }), groupClassName)}>
			{effectiveLeftSlot ? (
				<InputGroupAddon
					align="inline-start"
					className={addonVariants({ variant, position: "left" })}
				>
					{effectiveLeftSlot}
				</InputGroupAddon>
			) : null}
			<InputGroupInput
				ref={setInputRef}
				type={resolvedType}
				value={value}
				defaultValue={defaultValue}
				onChange={handleChange}
				disabled={disabled}
				readOnly={readOnly}
				className={cn(inputFieldInputVariants({ variant }), className, inputClassName)}
				{...props}
			/>
			{shouldRenderRightAddon ? (
				<InputGroupAddon
					align="inline-end"
					className={addonVariants({ variant, position: "right" })}
				>
					{rightSlot}
					{shouldShowClearButton ? (
						<InputGroupButton
							variant="icon"
							size="icon-sm"
							className="rounded-full text-muted-foreground hover:bg-transparent"
							onClick={handleClear}
							aria-label={clearButtonAriaLabel}
						>
							<CircleXIcon />
						</InputGroupButton>
					) : null}
					{canTogglePassword ? (
						<InputGroupButton
							variant="icon"
							size="icon-sm"
							className="rounded-full text-muted-foreground hover:bg-transparent"
							onClick={() => setIsPasswordVisible((prev) => !prev)}
							aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
						>
							{isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
						</InputGroupButton>
					) : null}
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
});

InputField.displayName = "InputField";

export { InputField };
export type { InputFieldProps };
