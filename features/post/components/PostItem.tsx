import Image from "next/image";

import type { PostSummaryDto } from "@/features/post/schemas";

import { Badge } from "@/shared/components/ui/badge";
import { Typography } from "@/shared/components/ui/typography";

import { formatRentalFeeLabel } from "@/shared/lib/format";

type PostItemProps = PostSummaryDto;

function PostItem(props: PostItemProps) {
	const { postTitle, postFirstImageUrl, rentalFee, feeUnit, rentalStatus } = props;
	const firstImageUrl = postFirstImageUrl || "/dummy-post-image.png";
	const rentalFeeLabel = formatRentalFeeLabel(rentalFee, feeUnit);

	return (
		<div className="flex gap-x-4">
			<div>
				<Image src={firstImageUrl} alt={postTitle} width={100} height={100} />
			</div>
			<div className="flex flex-col min-w-0 flex-1">
				<div>
					<div>
						<Typography type="body" className="truncate">
							{postTitle}
						</Typography>
					</div>
					<div>
						<Typography type="subtitle">{rentalFeeLabel}</Typography>
					</div>
				</div>
				<div>{rentalStatus === "RENTED_OUT" && <Badge>대여 중</Badge>}</div>
			</div>
		</div>
	);
}

export default PostItem;
