import * as React from "react";

import { Button } from "@/shared/components/ui/button";

type IconButtonBaseProps = Omit<
	React.ComponentProps<typeof Button>,
	"children" | "onClick" | "size"
> & {
	onClick?: React.ComponentProps<"button">["onClick"] | null;
	size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

type IconButtonProps =
	| (IconButtonBaseProps & { icon: React.ReactNode; children?: never })
	| (IconButtonBaseProps & { icon?: React.ReactNode; children: React.ReactNode });

function IconButton({
	icon,
	children,
	onClick,
	size = "icon",
	type = "button",
	...props
}: IconButtonProps) {
	return (
		<Button variant={"icon"} type={type} size={size} onClick={onClick ?? undefined} {...props}>
			{children ?? icon}
		</Button>
	);
}

export { IconButton };
