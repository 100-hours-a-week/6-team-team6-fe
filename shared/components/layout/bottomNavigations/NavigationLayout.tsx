interface NavigationLayoutProps {
	children: React.ReactNode;
}
function NavigationLayout(props: NavigationLayoutProps) {
	const { children } = props;
	return (
		<nav
			aria-label="Bottom navigation"
			className={`fixed bottom-0 left-1/2 h-[60px] w-full max-w-(--app-max-width) -translate-x-1/2 p-2 flex items-center border-t border-gray-200 
        bg-white z-[--z-nav]
				`}
		>
			{children}
		</nav>
	);
}

export default NavigationLayout;
