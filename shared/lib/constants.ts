export const uiConst = {
	WIDTH: {
		HEADER_LOGO: 70,
		MAX_WIDTH: 480,
	},
	HEIGHT: {
		HEADER_LOGO: 21,
	},
};

export const routeConst = {
	DEFAULT_AUTH_REDIRECT_PATH: "/groups",
};

export const LCP_IMAGE_PROPS = {
	preload: true,
	loading: "eager" as const,
	fetchPriority: "high" as const,
};
