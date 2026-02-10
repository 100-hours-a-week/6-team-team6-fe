"use client";

import Image from "next/image";

import type { PostDetailDto } from "@/features/post/schemas";

import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";

type PostDetailImagesProps = {
	images: PostDetailDto["imageUrls"]["imageInfos"];
};

function PostDetailImages(props: PostDetailImagesProps) {
	const { images } = props;

	return (
		<div>
			<Carousel showDots>
				<CarouselContent>
					{images.map((image, index) => (
						<CarouselItem key={image.postImageId} className="pl-0">
							<div className="relative w-full aspect-square">
								<Image
									fill
									src={image.imageUrl}
									alt={`Post image ${index + 1}`}
									sizes="100vw"
									className="object-cover"
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	);
}

export { PostDetailImages };
export type { PostDetailImagesProps };
