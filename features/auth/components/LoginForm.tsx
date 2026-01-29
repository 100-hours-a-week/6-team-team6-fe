"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthFormField } from "@/features/auth/components/AuthFormField";
import { loginSchema } from "@/features/auth/schemas";

import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Spinner } from "@/shared/components/ui/spinner";

import { routeConst } from "@/shared/lib/constants";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { authErrorMessages } from "@/shared/lib/error-messages";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
	onSubmit?: (values: LoginFormValues) => void | Promise<void>;
}

function LoginForm({ onSubmit }: LoginFormProps) {
	const router = useRouter();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			loginId: "",
			password: "",
		},
		mode: "onSubmit",
		reValidateMode: "onSubmit",
	});

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = form;

	const handleFormSubmit = async (values: LoginFormValues) => {
		try {
			if (onSubmit) {
				await onSubmit(values);
				return;
			}

			const result = await signIn("credentials", {
				redirect: false,
				loginId: values.loginId,
				password: values.password,
				callbackUrl: routeConst.DEFAULT_AUTH_REDIRECT_PATH,
			});

			if (!result || result.error) {
				const message =
					result?.error === "CredentialsSignin"
						? authErrorMessages.loginFailed
						: (getApiErrorMessage(result?.error) ?? authErrorMessages.loginUnknown);

				setSubmitError(message);
				return;
			}

			if (result.ok) {
				router.replace(result.url ?? routeConst.DEFAULT_AUTH_REDIRECT_PATH);
			} else {
				setSubmitError(authErrorMessages.loginUnknown);
			}
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : authErrorMessages.loginUnknown);
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
					autoComplete="current-password"
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

export default LoginForm;
