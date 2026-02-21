interface HeaderLayoutProps {
	left?: React.ReactNode;
	center?: React.ReactNode;
	right?: React.ReactNode;
}
function HeaderLayout(props: HeaderLayoutProps) {
	const { left, center, right } = props;
	return (
		<header className="h-12 px-2 sticky top-0 grid grid-cols-[auto_1fr_auto] place-items-center items-center border-b border-gray-200 bg-white z-(--z-header)">
			{left && <div className="justify-self-start  flex items-center justify-start">{left}</div>}
			{center && (
				<div className="justify-self-center w-full min-w-0 flex justify-center items-center">
					{center}
				</div>
			)}
			{right && <div className="justify-self-end  flex items-center justify-end">{right}</div>}
		</header>
	);
}

export default HeaderLayout;
