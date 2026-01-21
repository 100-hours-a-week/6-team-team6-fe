interface HeaderLayoutProps {
	left?: React.ReactNode;
	center?: React.ReactNode;
	right?: React.ReactNode;
}
function HeaderLayout(props: HeaderLayoutProps) {
	const { left, center, right } = props;
	return (
		<header className="h-10 px-2 sticky top-0 grid grid-cols-[1fr_auto_1fr] place-items-center items-center border-b border-gray-200 bg-white z-(--z-header)">
			<div className="justify-self-start">{left}</div>
			<div className="justify-self-center">{center}</div>
			<div className="justify-self-end">{right}</div>
		</header>
	);
}

export default HeaderLayout;
