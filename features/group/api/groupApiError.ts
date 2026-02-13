class GroupApiError extends Error {
	status: number;
	code?: string;

	constructor(name: string, status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = name;
		this.status = status;
		this.code = code;
	}
}

export { GroupApiError };
