class NotificationApiError extends Error {
	status: number;
	code?: string;

	constructor(name: string, status: number, code?: string) {
		super(code ?? "UNKNOWN_ERROR");
		this.name = name;
		this.status = status;
		this.code = code;
	}
}

class GetWebPushSettingError extends NotificationApiError {
	constructor(status: number, code?: string) {
		super("GetWebPushSettingError", status, code);
	}
}

class UpdateWebPushSettingError extends NotificationApiError {
	constructor(status: number, code?: string) {
		super("UpdateWebPushSettingError", status, code);
	}
}

class RegisterPushTokenError extends NotificationApiError {
	constructor(status: number, code?: string) {
		super("RegisterPushTokenError", status, code);
	}
}

class DeletePushTokenError extends NotificationApiError {
	constructor(status: number, code?: string) {
		super("DeletePushTokenError", status, code);
	}
}

export {
	DeletePushTokenError,
	GetWebPushSettingError,
	NotificationApiError,
	RegisterPushTokenError,
	UpdateWebPushSettingError,
};
