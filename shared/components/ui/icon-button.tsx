import * as React from "react";

import { Button } from "@/shared/components/ui/button";

type IconButtonProps = Omit<
	React.ComponentProps<typeof Button>,
	"children" | "onClick" | "size"
> & {
	icon: React.ReactNode;
	onClick?: React.ComponentProps<"button">["onClick"] | null;
	size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

function IconButton({ icon, onClick, size = "icon", type = "button", ...props }: IconButtonProps) {
	return (
		<Button variant={"icon"} type={type} size={size} onClick={onClick ?? undefined} {...props}>
			{icon}
		</Button>
	);
}

export { IconButton };
