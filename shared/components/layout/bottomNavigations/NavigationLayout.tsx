import { uiConst } from "@/shared/lib/constants";

interface NavigationLayoutProps {
	children: React.ReactNode;
}
function NavigationLayout(props: NavigationLayoutProps) {
	const { children } = props;
	return (
		<header
			className={`fixed bottom-0 left-1/2 h-[60px] w-full max-w-[var(--app-max-width)] -translate-x-1/2 p-2 flex items-center border-t border-gray-200 
        bg-white
        z-[${uiConst.Z_INDEX.NAV}]`}
		>
			{children}
		</header>
	);
}

export default NavigationLayout;
