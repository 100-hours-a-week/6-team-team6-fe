import { z } from "zod";

const PostSchema = z.object({
	postId: z.number(),
	title: z.string().min(1, "글 제목을 입력해 주세요."),
	content: z.string().min(1, "내용을 입력해 주세요."),
	images: z.array(z.string().min(1, "이미지 URL 형식이 올바르지 않습니다.")).min(1),
	sellerId: z.number(),
	sellerNickname: z.string().min(1),
	sellerAvartar: z.string().min(1),
	rentalFee: z.number().min(0, "대여료는 0 이상이어야 합니다."),
	feeUnit: z.enum(["HOUR", "DAY"]),
	rentalStatus: z.enum(["AVAILABLE", "RENTED_OUT"]),
	updatedAt: z.string().min(1),
	isSeller: z.boolean(),
	activeChatroomCount: z.number().min(0),
});

export type Post = z.infer<typeof PostSchema>;

export { PostSchema };
