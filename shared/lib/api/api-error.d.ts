import type { ApiErrorCode } from "@/shared/lib/api/api-error-codes";

declare global {
	namespace Api {
		namespace Error {
			type Code = ApiErrorCode;

			interface Response {
				code: Code;
			}

			interface Login extends Response {
				code: ApiErrorCode.AUTH_INVALID_CREDENTIALS;
			}

			interface Signup extends Response {
				code:
					| ApiErrorCode.USER_INVALID_LOGIN_ID
					| ApiErrorCode.USER_DUPLICATE_LOGIN_ID
					| ApiErrorCode.PARAMETER_INVALID;
			}
		}
	}
}

export {};
