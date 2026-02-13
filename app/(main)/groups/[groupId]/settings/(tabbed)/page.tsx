import { GroupSettingsPage } from "@/features/group/screens/GroupSettingsPage";

interface GroupSettingsRoutePageProps {
	params: Promise<{
		groupId: string;
	}>;
}

export default async function Page(props: GroupSettingsRoutePageProps) {
	const { groupId } = await props.params;

	return <GroupSettingsPage groupId={groupId} />;
}
