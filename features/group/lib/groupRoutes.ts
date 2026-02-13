type RouteParam = string | number;

const toPathValue = (value: RouteParam) => String(value);

export const groupRoutes = {
	list: () => "/groups",
	create: () => "/groups/create",
	posts: (groupId: RouteParam) => `/groups/${toPathValue(groupId)}/posts`,
	settings: (groupId: RouteParam) => `/groups/${toPathValue(groupId)}/settings`,
	postDetail: (groupId: RouteParam, postId: RouteParam) =>
		`/groups/${toPathValue(groupId)}/posts/${toPathValue(postId)}`,
};
