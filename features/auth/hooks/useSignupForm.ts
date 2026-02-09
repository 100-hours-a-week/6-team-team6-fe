"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { resolveAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import { signupSchema } from "@/features/auth/schemas";

import { apiClient } from "@/shared/lib/api/api-client";
import { apiErrorCodes } from "@/shared/lib/api/api-error-codes";
import { ApiRequestError, requestJson } from "@/shared/lib/api/request";
import StatusCodes from "@/shared/lib/api/status-codes";
import { authErrorMessages } from "@/shared/lib/error-messages";

const SignupResponseSchema = z.object({
	userId: z.number(),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type SignupFormSubmit = (values: SignupFormValues) => void | Promise<void>;

function useSignupForm(onSubmit?: SignupFormSubmit) {
	const router = useRouter();

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
		setError,
		formState: { isSubmitting },
	} = form;

	const handleFormSubmit = async (values: SignupFormValues) => {
		try {
			if (onSubmit) {
				await onSubmit(values);
				return;
			}

			await requestJson(
				apiClient.post("users", {
					json: {
						loginId: values.loginId,
						password: values.password,
					},
				}),
				SignupResponseSchema,
			);

			toast.success("회원가입이 완료되었습니다.");
			router.push("/login");
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				console.error(error);
			}
			if (error instanceof ApiRequestError) {
				if (
					error.status === StatusCodes.CONFLICT &&
					error.code === apiErrorCodes.USER_DUPLICATE_LOGIN_ID
				) {
					setError("loginId", {
						type: "server",
						message: authErrorMessages.signupExistingId,
					});
					return;
				}
			}

			toast.error(resolveAuthErrorMessage({ error, fallback: authErrorMessages.signupFailed }));
		}
	};

	return { form, isSubmitting, handleFormSubmit };
}

export type { SignupFormSubmit, SignupFormValues };
export default useSignupForm;
