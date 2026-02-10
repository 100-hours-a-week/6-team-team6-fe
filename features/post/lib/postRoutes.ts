type RouteParam = string | number;

const toPathValue = (value: RouteParam) => String(value);

export const postRoutes = {
	groupPosts: (groupId: RouteParam) => `/groups/${toPathValue(groupId)}/posts`,
	postDetail: (groupId: RouteParam, postId: RouteParam) =>
		`/groups/${toPathValue(groupId)}/posts/${toPathValue(postId)}`,
	postCreate: (groupId: RouteParam) => `/groups/${toPathValue(groupId)}/posts/create`,
	postEdit: (groupId: RouteParam, postId: RouteParam) =>
		`/groups/${toPathValue(groupId)}/posts/${toPathValue(postId)}/edit`,
	chatItemList: (postId: RouteParam) => `/chat?type=item&postId=${toPathValue(postId)}`,
	chatRoom: (chatroomId: RouteParam) => `/chat/${toPathValue(chatroomId)}`,
};
