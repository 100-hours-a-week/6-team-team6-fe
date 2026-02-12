"use client";

import Image from "next/image";

import type { PostDetailDto } from "@/features/post/schemas";

import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";

import { LCP_IMAGE_PROPS, uiConst } from "@/shared/lib/constants";

const POST_DETAIL_IMAGE_SIZES = `(max-width: ${uiConst.WIDTH.MAX_WIDTH}px) 100vw, ${uiConst.WIDTH.MAX_WIDTH}px`;

type PostDetailImagesProps = {
	images: PostDetailDto["imageUrls"]["imageInfos"];
};

function PostDetailImages(props: PostDetailImagesProps) {
	const { images } = props;

	if (images.length === 0) {
		return null;
	}

	if (images.length === 1) {
		return (
			<div className="relative w-full aspect-square">
				<Image
					fill
					src={images[0].imageUrl}
					alt="Post image"
					{...LCP_IMAGE_PROPS}
					sizes={POST_DETAIL_IMAGE_SIZES}
					className="object-cover"
				/>
			</div>
		);
	}

	return (
		<Carousel showDots>
			<CarouselContent>
				{images.map((image, index) => (
					<CarouselItem key={image.postImageId} className="pl-0">
						<div className="relative w-full aspect-square">
							<Image
								fill
								src={image.imageUrl}
								alt={`Post image`}
								{...(index === 0 ? LCP_IMAGE_PROPS : {})}
								sizes={POST_DETAIL_IMAGE_SIZES}
								className="object-cover"
							/>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}

export { PostDetailImages };
export type { PostDetailImagesProps };
