"use client";

import Image from "next/image";

import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { Typography } from "@/shared/components/ui/typography";

import { formatRentalFeeLabel } from "@/shared/lib/format";

const DUMMY_RECOMMENDED_POSTS = [
	{
		id: 1,
		title: "캠핑 랜턴 세트",
		rentalFee: 3000,
		feeUnit: "DAY" as const,
	},
	{
		id: 2,
		title: "무선 미니 프로젝터",
		rentalFee: 7000,
		feeUnit: "DAY" as const,
	},
	{
		id: 3,
		title: "폴라로이드 카메라",
		rentalFee: 5000,
		feeUnit: "DAY" as const,
	},
	{
		id: 4,
		title: "보드게임 스타터 팩",
		rentalFee: 2000,
		feeUnit: "DAY" as const,
	},
] as const;

function RecommendedPostsSection() {
	return (
		<div className="flex flex-col gap-y-4 pb-10">
			<div className="flex items-end justify-between gap-x-4">
				<div className="space-y-1">
					<Typography type="subtitle" className="text-xl">
						이런 물품은 어때요?
					</Typography>
					<Typography type="caption" className="block text-sm">
						좌우로 넘겨서 비슷한 대여 물품을 둘러보세요.
					</Typography>
				</div>
			</div>
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex gap-x-4 pb-4">
					{DUMMY_RECOMMENDED_POSTS.map((item) => (
						<article key={item.id} className="group w-40 shrink-0">
							<div className="overflow-hidden border">
								<div className="relative aspect-square overflow-hidden bg-muted">
									<Image
										fill
										src="/dummy-post-image.png"
										alt={`${item.title} 더미 이미지`}
										sizes="160px"
										className="object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
								<div className="flex flex-col gap-y-1.5 p-3">
									<Typography
										type="subtitle"
										className="line-clamp-2 whitespace-normal leading-snug"
									>
										{item.title}
									</Typography>
									<Typography type="body-sm">
										{formatRentalFeeLabel(item.rentalFee, item.feeUnit)}
									</Typography>
								</div>
							</div>
						</article>
					))}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

export { RecommendedPostsSection };
