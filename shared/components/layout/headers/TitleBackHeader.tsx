import { BackButton } from "@/shared/components/layout/headers/BackButton";
import HeaderLayout from "@/shared/components/layout/headers/HeaderLayout";
import { Typography } from "@/shared/components/ui/typography";

// TODO: link
interface TitleBackHeaderProps {
	title: string;
}

function TitleBackHeader(props: TitleBackHeaderProps) {
	const { title } = props;

	return (
		<HeaderLayout
			left={<BackButton />}
			center={<Typography type="subtitle">{title}</Typography>}
			right={<div></div>}
		/>
	);
}

export default TitleBackHeader;
