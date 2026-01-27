import type { ZodType } from "zod";

type ApiErrorBody = {
	errorCode?: string;
};

type ApiError = new (status: number, errorCode?: string) => Error;

class ApiRequestError extends Error {
	status: number;
	errorCode?: string;

	constructor(status: number, errorCode?: string) {
		super(errorCode ?? "UNKNOWN_ERROR");
		this.name = "ApiRequestError";
		this.status = status;
		this.errorCode = errorCode;
	}
}

const parseErrorCode = (data: unknown) => {
	if (typeof data === "object" && data !== null && "errorCode" in data) {
		return (data as ApiErrorBody).errorCode;
	}
	return undefined;
};

const getApiError = (status: number, errorCode: string | undefined, error?: ApiError): Error => {
	if (error) {
		return new error(status, errorCode);
	}
	return new ApiRequestError(status, errorCode);
};

const safeJson = async (response: Response): Promise<unknown> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

async function request<T>(
	responsePromise: Promise<Response>,
	schema: ZodType<T>,
	error?: ApiError,
): Promise<T>;
async function request<T = unknown>(
	responsePromise: Promise<Response>,
	schema?: ZodType<T>,
	error?: ApiError,
): Promise<T> {
	const response = await responsePromise;
	const data = await safeJson(response);

	if (!response.ok) {
		throw getApiError(response.status, parseErrorCode(data), error);
	}

	if (schema) {
		return schema.parse(data) as T;
	}

	return data as T;
}

async function requestVoid(responsePromise: Promise<Response>, error?: ApiError): Promise<void> {
	const response = await responsePromise;

	if (response.ok) {
		return;
	}

	const data = await safeJson(response);
	throw getApiError(response.status, parseErrorCode(data), error);
}

export { ApiRequestError, request, requestVoid };
