"use client";

import { DUMMY_POST_DETAIL_BY_ID, DUMMY_POST_SUMMARIES } from "@/features/post/constants";
import type { FeeUnit, PostDetailDto, PostSummaryDto, RentalStatus } from "@/features/post/schemas";

const USE_POST_MOCKS = false;
const MOCK_PAGE_SIZE = 10;
const MOCK_CURSOR_TIME = "2026-01-12T03:04:05.123456Z";

const summarySeedById = new Map<number, PostSummaryDto>(
	DUMMY_POST_SUMMARIES.map((summary) => [summary.postId, summary]),
);

const mockPostOrder: number[] = DUMMY_POST_SUMMARIES.map((summary) => summary.postId);
const mockPostDetailById = new Map<number, PostDetailDto>(DUMMY_POST_DETAIL_BY_ID);

DUMMY_POST_DETAIL_BY_ID.forEach((_value, postId) => {
	if (!mockPostOrder.includes(postId)) {
		mockPostOrder.push(postId);
	}
});

const initialPostId = mockPostOrder.reduce((max, id) => Math.max(max, id), 0);
const initialImageId = Array.from(DUMMY_POST_DETAIL_BY_ID.values()).reduce((max, detail) => {
	return detail.imageUrls.imageInfos.reduce((innerMax, image) => {
		return Math.max(innerMax, image.postImageId);
	}, max);
}, 0);

let mockPostIdCounter = initialPostId;
let mockImageIdCounter = initialImageId;

const baseSeller = (() => {
	const first = mockPostDetailById.values().next().value as PostDetailDto | undefined;
	return {
		sellerId: first?.sellerId ?? 1,
		sellerNickname: first?.sellerNickname ?? "Me",
		sellerAvatar: first?.sellerAvatar ?? "/default-profile.png",
	};
})();

type MockCursor = {
	time: string;
	id: number;
};

type MockPostSummariesPage = {
	summaries: PostSummaryDto[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

const encodeCursor = (id: number) =>
	btoa(
		JSON.stringify({
			time: MOCK_CURSOR_TIME,
			id,
		} satisfies MockCursor),
	);

const decodeCursor = (cursor?: string) => {
	if (!cursor) {
		return null;
	}

	try {
		const decoded = JSON.parse(atob(cursor)) as MockCursor;
		return typeof decoded?.id === "number" ? decoded.id : null;
	} catch {
		return null;
	}
};

const getPrimaryImage = (detail: PostDetailDto | undefined, seed: PostSummaryDto | undefined) => {
	const imageInfo = detail?.imageUrls.imageInfos[0];
	if (imageInfo) {
		return { postImageId: imageInfo.postImageId, postFirstImageUrl: imageInfo.imageUrl };
	}

	if (seed) {
		return { postImageId: seed.postImageId, postFirstImageUrl: seed.postFirstImageUrl };
	}

	return { postImageId: 0, postFirstImageUrl: "/dummy-post-image.png" };
};

const buildSummary = (postId: number): PostSummaryDto => {
	const detail = mockPostDetailById.get(postId);
	const seed = summarySeedById.get(postId);
	const primaryImage = getPrimaryImage(detail, seed);

	return {
		postId,
		postTitle: detail?.title ?? seed?.postTitle ?? "",
		postImageId: primaryImage.postImageId,
		postFirstImageUrl: primaryImage.postFirstImageUrl,
		rentalFee: detail?.rentalFee ?? seed?.rentalFee ?? 0,
		feeUnit: detail?.feeUnit ?? seed?.feeUnit ?? "HOUR",
		rentalStatus: detail?.rentalStatus ?? seed?.rentalStatus ?? "AVAILABLE",
	};
};

const getMockPostSummariesPage = (
	cursor?: string,
	pageSize: number = MOCK_PAGE_SIZE,
): MockPostSummariesPage => {
	const cursorId = decodeCursor(cursor);
	const startIndex =
		cursorId === null ? 0 : mockPostOrder.findIndex((postId) => postId === cursorId) + 1;
	const safeStartIndex = Math.max(0, startIndex);
	const pageIds = mockPostOrder.slice(safeStartIndex, safeStartIndex + pageSize);
	const summaries = pageIds.map((postId) => buildSummary(postId));
	const hasNextPage = safeStartIndex + pageSize < mockPostOrder.length;
	const lastPostId = pageIds.at(-1);

	return {
		summaries,
		nextCursor: hasNextPage && lastPostId ? encodeCursor(lastPostId) : null,
		hasNextPage,
	};
};

const getMockPostDetail = (postId: number) => mockPostDetailById.get(postId) ?? null;

const updateMockPostStatus = (postId: number, status: RentalStatus) => {
	const existing = mockPostDetailById.get(postId);
	if (!existing) {
		return null;
	}

	mockPostDetailById.set(postId, {
		...existing,
		rentalStatus: status,
		updatedAt: new Date().toISOString(),
	});

	return { postId, status };
};

const updateMockPost = (params: {
	postId: number;
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
	imageUrls: { postImageId: number | null; imageUrl: string }[];
	newImages: File[];
}) => {
	const { postId, title, content, rentalFee, feeUnit, imageUrls, newImages } = params;
	const existing = mockPostDetailById.get(postId);
	if (!existing) {
		return null;
	}

	const keptImages = imageUrls.map((image) => ({
		postImageId: image.postImageId ?? ++mockImageIdCounter,
		imageUrl: image.imageUrl,
	}));

	const newImageInfos = newImages.map(() => ({
		postImageId: ++mockImageIdCounter,
		imageUrl: "/dummy-post-image.png",
	}));

	const nextImages = [...keptImages, ...newImageInfos];

	mockPostDetailById.set(postId, {
		...existing,
		title,
		content,
		rentalFee,
		feeUnit,
		imageUrls: {
			imageInfos: nextImages,
		},
		updatedAt: new Date().toISOString(),
	});

	return { postId };
};

const createMockPost = (params: {
	title: string;
	content: string;
	rentalFee: number;
	feeUnit: FeeUnit;
	newImages: File[];
}) => {
	const { title, content, rentalFee, feeUnit, newImages } = params;
	const postId = ++mockPostIdCounter;
	const imageInfos = newImages.length
		? newImages.map(() => ({
				postImageId: ++mockImageIdCounter,
				imageUrl: "/dummy-post-image.png",
			}))
		: [{ postImageId: ++mockImageIdCounter, imageUrl: "/dummy-post-image.png" }];

	const detail: PostDetailDto = {
		title,
		content,
		imageUrls: { imageInfos },
		sellerId: baseSeller.sellerId,
		sellerNickname: baseSeller.sellerNickname,
		sellerAvatar: baseSeller.sellerAvatar,
		rentalFee,
		feeUnit,
		rentalStatus: "AVAILABLE",
		updatedAt: new Date().toISOString(),
		isSeller: true,
		chatroomId: -1,
		activeChatroomCount: 0,
	};

	mockPostDetailById.set(postId, detail);
	mockPostOrder.unshift(postId);
	summarySeedById.set(postId, buildSummary(postId));

	return { postId };
};

const deleteMockPost = (postId: number) => {
	if (!mockPostDetailById.has(postId)) {
		return false;
	}

	mockPostDetailById.delete(postId);
	summarySeedById.delete(postId);
	const index = mockPostOrder.findIndex((id) => id === postId);
	if (index >= 0) {
		mockPostOrder.splice(index, 1);
	}

	return true;
};

export {
	createMockPost,
	deleteMockPost,
	getMockPostDetail,
	getMockPostSummariesPage,
	updateMockPost,
	updateMockPostStatus,
	USE_POST_MOCKS,
};
export type { MockPostSummariesPage };
