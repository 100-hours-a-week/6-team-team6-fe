import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { Typography } from "@/shared/components/ui/typography";

interface TitleBackHeaderProps {
	title: string;
}

function TitleBackHeader(props: TitleBackHeaderProps) {
	const { title } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={
				<Typography type="subtitle" className="truncate max-w-full">
					{title}
				</Typography>
			}
			right={<div className="w-11 h-11" />}
		/>
	);
}

export default TitleBackHeader;
