export const groupQueryKeys = {
	all: () => ["groups"] as const,
	myGroups: () => [...groupQueryKeys.all(), "me"] as const,
	detail: (groupId: string) => [...groupQueryKeys.all(), groupId, "detail"] as const,
	membershipMe: (groupId: string) => [...groupQueryKeys.all(), groupId, "membership", "me"] as const,
	invitation: (groupId: string) => [...groupQueryKeys.all(), groupId, "invitation"] as const,
	keywordSubscriptions: (groupId: string) =>
		[...groupQueryKeys.all(), groupId, "keyword-subscriptions"] as const,
	myPosts: () => ["posts", "me", "summaries"] as const,
};
