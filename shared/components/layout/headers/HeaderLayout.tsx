interface HeaderLayoutProps {
	children: React.ReactNode;
}
function HeaderLayout(props: HeaderLayoutProps) {
	const { children } = props;
	return (
		<header
			className={`h-10 p-2 sticky top-0 flex items-center border-b border-gray-200 
        bg-white
				z-(--z-header)`}
		>
			{children}
		</header>
	);
}

export default HeaderLayout;
