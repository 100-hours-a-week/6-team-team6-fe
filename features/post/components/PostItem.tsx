import Image from "next/image";

import { Post } from "@/features/post/schemas";

import { Badge } from "@/shared/components/ui/badge";
import { Typography } from "@/shared/components/ui/typography";

type PostItemProps = Post;

function PostItem(props: PostItemProps) {
	const { title, images, rentalFee, feeUnit, rentalStatus } = props;
	const firstImageUrl = images[0] ?? "/dummy-post-image.png";

	return (
		<div className="flex gap-x-4">
			<div>
				<Image src={firstImageUrl} alt={title} width={100} height={100} />
			</div>
			<div className="flex flex-col">
				<div>
					<div>
						<Typography type="body">{title}</Typography>
					</div>
					<div>
						{rentalFee === 0 ? (
							<Typography type="subtitle">무료 대여</Typography>
						) : (
							<Typography type="subtitle">
								{rentalFee} / {feeUnit === "HOUR" ? "시간" : "일"}
							</Typography>
						)}
					</div>
				</div>
				<div>{rentalStatus === "RENTED_OUT" && <Badge>대여 중</Badge>}</div>
			</div>
		</div>
	);
}

export default PostItem;
