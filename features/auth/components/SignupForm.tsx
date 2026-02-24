"use client";

import type { UseFormReturn } from "react-hook-form";

import { AuthFormField } from "@/features/auth/components/AuthFormField";
import useSignupForm, {
	type SignupFormSubmit,
	type SignupFormValues,
} from "@/features/auth/hooks/useSignupForm";

import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Spinner } from "@/shared/components/ui/spinner";

interface SignupFormProps {
	onSubmit?: SignupFormSubmit;
}

type SignupFormViewProps = {
	form: UseFormReturn<SignupFormValues>;
	onSubmit: SignupFormSubmit;
	isSubmitting: boolean;
};

function SignupFormView(props: SignupFormViewProps) {
	const { form, onSubmit, isSubmitting } = props;
	const { handleSubmit, control } = form;

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<AuthFormField
					control={control}
					name="loginId"
					label="아이디"
					placeholder="아이디를 입력하세요"
					autoComplete="username"
					clearable
				/>

				<AuthFormField
					control={control}
					name="password"
					label="비밀번호"
					placeholder="비밀번호를 입력하세요"
					type="password"
					autoComplete="new-password"
					passwordToggle
					clearable
				/>

				<AuthFormField
					control={control}
					name="confirmPassword"
					label="비밀번호 확인"
					placeholder="비밀번호를 다시 입력하세요"
					type="password"
					autoComplete="new-password"
					passwordToggle
					clearable
				/>

				<Button size="lg" type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
					{isSubmitting ? <Spinner /> : "회원가입"}
				</Button>
			</form>
		</Form>
	);
}

function SignupForm(props: SignupFormProps) {
	const { onSubmit } = props;
	const { form, isSubmitting, handleFormSubmit } = useSignupForm(onSubmit);

	return <SignupFormView form={form} isSubmitting={isSubmitting} onSubmit={handleFormSubmit} />;
}

export default SignupForm;
