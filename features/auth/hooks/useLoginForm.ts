"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { loginSchema } from "@/features/auth/schemas";

import { routeConst } from "@/shared/lib/constants";
import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { authErrorMessages } from "@/shared/lib/error-messages";

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginFormSubmit = (values: LoginFormValues) => void | Promise<void>;

function useLoginForm(onSubmit?: LoginFormSubmit) {
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

	return { form, submitError, isSubmitting, handleFormSubmit };
}

export type { LoginFormSubmit, LoginFormValues };
export default useLoginForm;
