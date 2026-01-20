"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

const loginSchema = z.object({
	loginId: z
		.string()
		.regex(/^[A-Za-z0-9]{5,20}$/, "영문 혹은 영문과 숫자를 조합하여 5자~20자로 입력해 주세요."),
	password: z
		.string()
		.min(1, "비밀번호를 입력해 주세요.")
		.regex(
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]{8,16}$/,
			"비밀번호는 8~16자이며 대/소문자, 숫자, 특수문자를 포함해야 합니다.",
		),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
	onSubmit?: (values: LoginFormValues) => void | Promise<void>;
}

const DEFAULT_REDIRECT_PATH = "/groups";

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
		setSubmitError(null);

		try {
			if (onSubmit) {
				await onSubmit(values);
			}
			// TODO: Replace with group-specific route when the login API returns a group id.
			// router.push(DEFAULT_REDIRECT_PATH);
			alert("");
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "로그인에 실패했습니다. 다시 시도해 주세요.",
			);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
				<FormField
					control={control}
					name="loginId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>아이디</FormLabel>
							<FormControl>
								<Input placeholder="아이디를 입력하세요" autoComplete="username" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>비밀번호</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="비밀번호를 입력하세요"
									autoComplete="current-password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{submitError ? (
					<p className="text-destructive text-sm" role="alert">
						{submitError}
					</p>
				) : null}

				<Button size="lg" type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? "로그인 중..." : "로그인"}
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

export { LoginForm, type LoginFormValues, loginSchema };
