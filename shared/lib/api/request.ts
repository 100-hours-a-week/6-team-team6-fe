import type { ZodError, ZodType } from "zod";

type ApiErrorBody = {
	code?: string;
	errorCode?: string;
};

type ApiError = new (status: number, code?: string) => Error;

class ApiRequestError extends Error {
	status: number;
	code?: string;

	constructor(status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = "ApiRequestError";
		this.status = status;
		this.code = code;
	}
}

class ApiSchemaError extends Error {
	status: number;
	issues: ZodError["issues"];
	data: unknown;

	constructor(status: number, issues: ZodError["issues"], data: unknown) {
		super("INVALID_RESPONSE_SCHEMA");
		this.name = "ApiSchemaError";
		this.status = status;
		this.issues = issues;
		this.data = data;
	}
}

const parseErrorCode = (data: unknown) => {
	if (typeof data === "object" && data !== null) {
		const body = data as ApiErrorBody;
		return body.code ?? body.errorCode;
	}
	return undefined;
};

const getApiError = (status: number, code: string | undefined, error?: ApiError): Error => {
	if (error) {
		return new error(status, code);
	}
	return new ApiRequestError(status, code);
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
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			if (process.env.NODE_ENV !== "production") {
				console.error("API response schema mismatch", parsed.error.flatten(), data);
			}
			throw new ApiSchemaError(response.status, parsed.error.issues, data);
		}
		return parsed.data as T;
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

export { ApiRequestError, ApiSchemaError, request, requestVoid };
