import type { ApiErrorCode } from "@/shared/lib/api/api-error-codes";

declare global {
	namespace Api {
		namespace Error {
			type Code = ApiErrorCode;

			interface Response {
				errorCode: Code;
			}

			interface Login extends Response {
				errorCode: Code.LOGIN_FAILED;
			}

			interface Signup extends Response {
				// TODO: fix typo - EXSTING_ID
				errorCode: Code.INVALID_LOGIN_ID_INPUT | Code.INVALID_PASSWORD_INPUT | Code.EXSTING_ID;
			}
		}
	}
}

export {};
