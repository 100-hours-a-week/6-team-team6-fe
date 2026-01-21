import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

type AuthFormFieldProps<TFieldValues extends FieldValues> = {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label: string;
	placeholder: string;
	type?: string;
	autoComplete?: string;
};

function AuthFormField<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	type = "text",
	autoComplete,
}: AuthFormFieldProps<TFieldValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Input type={type} placeholder={placeholder} autoComplete={autoComplete} {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export { AuthFormField };
