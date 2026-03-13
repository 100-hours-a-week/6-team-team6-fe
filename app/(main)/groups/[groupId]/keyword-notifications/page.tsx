import { KeywordNotificationsPage } from "@/features/group/screens/KeywordNotificationsPage";

interface KeywordNotificationsRoutePageProps {
	params: Promise<{
		groupId: string;
	}>;
}

export default async function Page(props: KeywordNotificationsRoutePageProps) {
	const { groupId } = await props.params;

	return <KeywordNotificationsPage groupId={groupId} />;
}
