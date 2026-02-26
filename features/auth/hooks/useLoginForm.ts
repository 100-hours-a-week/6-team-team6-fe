"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { resolveAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import { loginSchema } from "@/features/auth/schemas";
import { enableWebPush } from "@/features/notification/lib/enableWebPush";
import { requestNotificationPermission } from "@/features/notification/lib/requestNotificationPermission";

import { routeConst } from "@/shared/lib/constants";
import { authErrorMessages } from "@/shared/lib/error-messages";

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginFormSubmit = (values: LoginFormValues) => void | Promise<void>;

function useLoginForm() {
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
		formState: { isSubmitting },
	} = form;

	const handleFormSubmit = async (values: LoginFormValues) => {
		setSubmitError(null);

		let signInResult: Awaited<ReturnType<typeof signIn>>;
		try {
			signInResult = await signIn("credentials", {
				redirect: false,
				loginId: values.loginId,
				password: values.password,
				callbackUrl: routeConst.DEFAULT_AUTH_REDIRECT_PATH,
			});
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : authErrorMessages.loginUnknown);
			return;
		}

		if (!signInResult || signInResult.error) {
			setSubmitError(
				resolveAuthErrorMessage({
					code: signInResult?.error,
					fallback: authErrorMessages.loginUnknown,
				}),
			);
			return;
		}

		if (!signInResult.ok) {
			setSubmitError(authErrorMessages.loginUnknown);
			return;
		}

		try {
			const permission = await requestNotificationPermission();
			if (permission !== "granted") {
				return;
			}

			await enableWebPush();
		} catch {
		}
		router.replace(signInResult.url ?? routeConst.DEFAULT_AUTH_REDIRECT_PATH);
	};

	return { form, submitError, isSubmitting, handleFormSubmit };
}

export type { LoginFormSubmit, LoginFormValues };
export default useLoginForm;
