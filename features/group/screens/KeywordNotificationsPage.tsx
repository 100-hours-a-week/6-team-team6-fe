"use client";

import { KeywordNotificationsView } from "@/features/group/components/KeywordNotificationsView";
import { useKeywordNotifications } from "@/features/group/hooks/useKeywordNotifications";

import TitleBackHeader from "@/shared/components/layout/headers/TitleBackHeader";

interface KeywordNotificationsPageProps {
	groupId: string;
}

function KeywordNotificationsPage(props: KeywordNotificationsPageProps) {
	const { groupId } = props;
	const { state, actions, labels } = useKeywordNotifications(groupId);

	return (
		<>
			<TitleBackHeader title={labels.title} />
			<KeywordNotificationsView state={state} actions={actions} labels={labels} />
		</>
	);
}

export { KeywordNotificationsPage };
