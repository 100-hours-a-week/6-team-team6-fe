import { z } from "zod";

const loginIdRequiredSchema = z.string().min(1, "아이디를 입력해 주세요.");

const loginIdSchema = loginIdRequiredSchema.regex(
	/^[A-Za-z0-9]{5,20}$/,
	"영문 혹은 영문과 숫자를 조합하여 5자~20자로 입력해 주세요.",
);

const passwordRequiredSchema = z.string().min(1, "비밀번호를 입력해 주세요.");

const passwordSchema = passwordRequiredSchema.regex(
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]{8,16}$/,
	"비밀번호는 8~16자이며 대/소문자, 숫자, 특수문자를 포함해야 합니다.",
);

const loginSchema = z.object({
	loginId: loginIdRequiredSchema,
	password: passwordRequiredSchema,
});

const signupSchema = z
	.object({
		loginId: loginIdSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "비밀번호가 일치하지 않습니다.",
		path: ["confirmPassword"],
	});

export { loginIdSchema, loginSchema, passwordSchema, signupSchema };
