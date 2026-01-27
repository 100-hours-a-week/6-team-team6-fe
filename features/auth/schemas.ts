import { z } from "zod";

import { authValidationMessages } from "@/shared/lib/error-messages";

const loginIdRequiredSchema = z
	.string()
	.min(1, authValidationMessages.loginIdRequired);

const loginIdSchema = loginIdRequiredSchema.regex(
	/^[A-Za-z0-9]{5,20}$/,
	authValidationMessages.loginIdInvalid,
);

const passwordRequiredSchema = z
	.string()
	.min(1, authValidationMessages.passwordRequired);

const passwordSchema = passwordRequiredSchema.regex(
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]{8,16}$/,
	authValidationMessages.passwordInvalid,
);

const loginSchema = z.object({
	loginId: loginIdRequiredSchema,
	password: passwordRequiredSchema,
});

const signupSchema = z
	.object({
		loginId: loginIdSchema,
		password: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, authValidationMessages.confirmPasswordRequired),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: authValidationMessages.passwordMismatch,
		path: ["confirmPassword"],
	});

export { loginIdSchema, loginSchema, passwordSchema, signupSchema };
