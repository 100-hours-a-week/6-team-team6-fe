interface GroupLayoutProps {
	children: React.ReactNode;
}

function GroupPostDetailLayout(props: GroupLayoutProps) {
	const { children } = props;
	// TODO: 검증 로직

	return <>{children}</>;
}

export default GroupPostDetailLayout;
