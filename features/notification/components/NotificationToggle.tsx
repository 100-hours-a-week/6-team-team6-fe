import { Switch } from "@/shared/components/ui/switch";

interface NotificationToggleProps {
	checked: boolean;
	onCheckedChange: (nextChecked: boolean) => void;
	ariaLabel: string;
	size?: "sm" | "default" | "lg";
	disabled?: boolean;
}

function NotificationToggle(props: NotificationToggleProps) {
	const { checked, onCheckedChange, ariaLabel, size = "default", disabled = false } = props;

	return (
		<Switch
			className="cursor-pointer"
			size={size}
			checked={checked}
			onCheckedChange={onCheckedChange}
			disabled={disabled}
			aria-label={ariaLabel}
		/>
	);
}

export { NotificationToggle };
export type { NotificationToggleProps };
