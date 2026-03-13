import { z } from "zod";

const webPushSettingSchema = z
	.object({
		enabled: z.boolean(),
	})
	.nullable();

const webPushSettingUpdateSchema = z.object({
	enabled: z.boolean(),
});

const pushTokenPlatformSchema = z.enum(["WEB", "IOS", "AOS"]);

const pushTokenRegisterSchema = z.object({
	platform: pushTokenPlatformSchema,
	deviceId: z.string().min(1),
	newToken: z.string().min(1),
});

const notificationTypeSchema = z.enum(["CHATROOM", "POST"]);

const notificationBaseSchema = z.object({
	notificationId: z.number().int(),
	title: z.string().min(1),
	groupName: z.string().min(1),
	groupId: z.number().int(),
	description: z.string().min(1),
	createdAt: z.string().min(1),
	postFirstImageUrl: z.string().nullable(),
});

const chatroomNotificationSchema = notificationBaseSchema.extend({
	type: z.literal("CHATROOM"),
	chatroomId: z.number().int(),
	postId: z.null(),
});

const postNotificationSchema = notificationBaseSchema.extend({
	type: z.literal("POST"),
	chatroomId: z.null(),
	postId: z.number().int(),
});

const notificationSchema = z.union([chatroomNotificationSchema, postNotificationSchema]);

const notificationsResponseSchema = z.object({
	notifications: z.array(notificationSchema),
	nextCursor: z.string().nullable().optional(),
	hasNext: z.boolean(),
});

type WebPushSettingDto = z.infer<typeof webPushSettingSchema>;
type WebPushSettingUpdateDto = z.infer<typeof webPushSettingUpdateSchema>;
type PushTokenRegisterDto = z.infer<typeof pushTokenRegisterSchema>;
type Notification = z.infer<typeof notificationSchema>;
type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;

export {
	chatroomNotificationSchema,
	notificationBaseSchema,
	notificationSchema,
	notificationsResponseSchema,
	notificationTypeSchema,
	postNotificationSchema,
	pushTokenPlatformSchema,
	pushTokenRegisterSchema,
	webPushSettingSchema,
	webPushSettingUpdateSchema,
};
export type {
	Notification,
	NotificationsResponse,
	PushTokenRegisterDto,
	WebPushSettingDto,
	WebPushSettingUpdateDto,
};
