const isErrorWithStatus = (error: unknown, status: number) =>
	typeof error === "object" &&
	error !== null &&
	"status" in error &&
	(error as { status?: unknown }).status === status;

const getApiErrorCode = (error: unknown): string | undefined => {
	if (typeof error !== "object" || error === null) {
		return undefined;
	}

	if ("code" in error) {
		const code = (error as { code?: unknown }).code;
		if (typeof code === "string") {
			return code;
		}
	}

	if ("errorCode" in error) {
		const errorCode = (error as { errorCode?: unknown }).errorCode;
		if (typeof errorCode === "string") {
			return errorCode;
		}
	}

	return undefined;
};

export { getApiErrorCode, isErrorWithStatus };
