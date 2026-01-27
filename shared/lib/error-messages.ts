export const authValidationMessages = {
	loginIdRequired: "아이디를 입력해 주세요.",
	loginIdInvalid: "영문 혹은 영문과 숫자를 조합하여 5자~20자로 입력해 주세요.",
	passwordRequired: "비밀번호를 입력해 주세요.",
	passwordInvalid: "비밀번호는 8~16자이며 대/소문자, 숫자, 특수문자를 포함해야 합니다.",
	confirmPasswordRequired: "비밀번호 확인을 입력해 주세요.",
	passwordMismatch: "비밀번호가 일치하지 않습니다.",
} as const;

export const authErrorMessages = {
	loginFailed: "아이디 또는 비밀번호를 확인해 주세요.",
	loginUnknown: "로그인에 실패했습니다. 다시 시도해 주세요.",
	signupExistingId: "이미 존재하는 아이디입니다.",
	signupFailed: "회원가입에 실패했습니다. 다시 시도해 주세요.",
} as const;
