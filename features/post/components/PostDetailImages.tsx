"use client";

import Image from "next/image";

import type { PostDetailDto } from "@/features/post/schemas";

import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";

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
					priority
					sizes="100vw"
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
								priority={index === 0}
								sizes="100vw"
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
