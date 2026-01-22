import { cn } from "@/shared/lib/utils";

interface HorizontalPaddingBoxProps {
	children: React.ReactNode;
	className?: string;
}

function HorizontalPaddingBox({ children, className }: HorizontalPaddingBoxProps) {
	return <div className={cn("px-(--p-layout-horizontal)", className)}>{children}</div>;
}

export default HorizontalPaddingBox;
