import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { InputField } from "@/shared/components/ui/input-field";

type AuthFormFieldProps<TFieldValues extends FieldValues> = {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label: string;
	placeholder: string;
	type?: string;
	autoComplete?: string;
	clearable?: boolean;
	passwordToggle?: boolean;
};

function AuthFormField<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	type = "text",
	autoComplete,
	clearable = false,
	passwordToggle = false,
}: AuthFormFieldProps<TFieldValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<InputField
							type={type}
							placeholder={placeholder}
							autoComplete={autoComplete}
							clearable={clearable}
							passwordToggle={passwordToggle}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export { AuthFormField };
