"use client";

import * as React from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";

export interface SelectOption {
	value: string;
	label: React.ReactNode;
	disabled?: boolean;
}

interface SelectFieldProps extends Omit<React.ComponentProps<typeof Select>, "children"> {
	options: SelectOption[];
	ariaLabel: string;
	placeholder?: string;
	size?: "sm" | "default";
	triggerClassName?: string;
	contentClassName?: string;
}

function SelectField(props: SelectFieldProps) {
	const {
		options,
		ariaLabel,
		placeholder,
		size = "default",
		triggerClassName,
		contentClassName,
		...selectProps
	} = props;

	return (
		<Select {...selectProps}>
			<SelectTrigger size={size} aria-label={ariaLabel} className={triggerClassName}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className={contentClassName}>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export { SelectField };
