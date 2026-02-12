const postQueryKeys = {
	all: ["posts"] as const,
	group: (groupId: string) => [...postQueryKeys.all, "group", groupId] as const,
	list: (groupId: string) => [...postQueryKeys.group(groupId), "list"] as const,
	detail: (groupId: string, postId: string) =>
		[...postQueryKeys.group(groupId), "detail", postId] as const,
};

export { postQueryKeys };
