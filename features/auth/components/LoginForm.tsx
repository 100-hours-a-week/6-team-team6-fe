"use client";

import Link from "next/link";

import type { UseFormReturn } from "react-hook-form";

import { AuthFormField } from "@/features/auth/components/AuthFormField";
import useLoginForm, {
	type LoginFormSubmit,
	type LoginFormValues,
} from "@/features/auth/hooks/useLoginForm";

import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Spinner } from "@/shared/components/ui/spinner";

type LoginFormViewProps = {
	form: UseFormReturn<LoginFormValues>;
	onSubmit: LoginFormSubmit;
	submitError: string | null;
	isSubmitting: boolean;
};

function LoginFormView({ form, onSubmit, submitError, isSubmitting }: LoginFormViewProps) {
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
					autoComplete="current-password"
					passwordToggle
					clearable
				/>

				{submitError ? (
					<p className="text-destructive text-sm" role="alert">
						{submitError}
					</p>
				) : null}

				<Button size="lg" type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
					{isSubmitting ? <Spinner /> : "로그인"}
				</Button>
				<div className="text-muted-foreground text-sm flex items-center justify-center gap-1">
					<Link href="/signup" className="text-foreground underline underline-offset-4">
						회원가입
					</Link>
				</div>
			</form>
		</Form>
	);
}

function LoginForm() {
	const { form, submitError, isSubmitting, handleFormSubmit } = useLoginForm();

	return (
		<LoginFormView
			form={form}
			submitError={submitError}
			isSubmitting={isSubmitting}
			onSubmit={handleFormSubmit}
		/>
	);
}

export default LoginForm;
