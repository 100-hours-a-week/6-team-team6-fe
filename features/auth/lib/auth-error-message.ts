import { getApiErrorMessage } from "@/shared/lib/error-message-map";
import { authErrorMessages } from "@/shared/lib/error-messages";

type ResolveAuthErrorMessageParams = {
	error?: unknown;
	code?: string | null;
	fallback: string;
};

function extractErrorCode(error?: unknown): string | undefined {
	if (!error) {
		return undefined;
	}

	if (typeof error === "string") {
		return error;
	}

	if (typeof error === "object" && error !== null) {
		const maybeApiError = error as { code?: string; message?: string };
		return maybeApiError.code ?? maybeApiError.message ?? undefined;
	}

	return undefined;
}

function resolveAuthErrorMessage({ error, code, fallback }: ResolveAuthErrorMessageParams) {
	const resolvedCode = code ?? extractErrorCode(error);

	if (resolvedCode === "CredentialsSignin") {
		return authErrorMessages.loginFailed;
	}

	return getApiErrorMessage(resolvedCode) ?? fallback;
}

export type { ResolveAuthErrorMessageParams };
export { resolveAuthErrorMessage };
