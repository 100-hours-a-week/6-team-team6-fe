interface HeaderLayoutProps {
	left?: React.ReactNode;
	center?: React.ReactNode;
	right?: React.ReactNode;
}
function HeaderLayout(props: HeaderLayoutProps) {
	const { left, center, right } = props;
	return (
		<header className="h-10 px-2 sticky top-0 grid grid-cols-[auto_1fr_auto] place-items-center items-center border-b border-gray-200 bg-white z-(--z-header)">
			<div className="justify-self-start">{left}</div>
			<div className="justify-self-center w-full flex justify-center items-center">{center}</div>
			<div className="justify-self-end">{right}</div>
		</header>
	);
}

export default HeaderLayout;
