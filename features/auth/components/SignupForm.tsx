"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthFormField } from "@/features/auth/components/AuthFormField";
import { signupSchema } from "@/features/auth/schemas";

import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Spinner } from "@/shared/components/ui/spinner";

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
	onSubmit?: (values: SignupFormValues) => void | Promise<void>;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			loginId: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit",
		reValidateMode: "onSubmit",
	});

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = form;

	const handleFormSubmit = async (values: SignupFormValues) => {
		if (onSubmit) {
			await onSubmit(values);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
				<AuthFormField
					control={control}
					name="loginId"
					label="아이디"
					placeholder="아이디를 입력하세요"
					autoComplete="username"
				/>

				<AuthFormField
					control={control}
					name="password"
					label="비밀번호"
					placeholder="비밀번호를 입력하세요"
					type="password"
					autoComplete="new-password"
				/>

				<AuthFormField
					control={control}
					name="confirmPassword"
					label="비밀번호 확인"
					placeholder="비밀번호를 다시 입력하세요"
					type="password"
					autoComplete="new-password"
				/>

				<Button size="lg" type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
					{isSubmitting ? <Spinner /> : "회원가입"}
				</Button>
			</form>
		</Form>
	);
}

export default SignupForm;
