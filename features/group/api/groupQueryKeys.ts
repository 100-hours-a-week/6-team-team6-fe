export const groupQueryKeys = {
	all: () => ["groups"] as const,
	myGroups: () => [...groupQueryKeys.all(), "me"] as const,
	myPosts: () => ["posts", "me", "summaries"] as const,
};
