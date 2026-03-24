import { z } from "zod";

import { notificationTypes, pushTokenPlatformValues } from "@/features/notification/lib/constants";

const webPushSettingSchema = z
	.object({
		enabled: z.boolean(),
	})
	.nullable();

const webPushSettingUpdateSchema = z.object({
	enabled: z.boolean(),
});

const pushTokenPlatformSchema = z.enum(pushTokenPlatformValues);

const pushTokenRegisterSchema = z.object({
	platform: pushTokenPlatformSchema,
	deviceId: z.string().min(1),
	newToken: z.string().min(1),
});

const notificationSchemaBase = z.object({
	notificationId: z.number().int(),
	title: z.string().min(1),
	groupName: z.string().min(1),
	groupId: z.number().int(),
	description: z.string().min(1),
	createdAt: z.string().min(1),
	postFirstImageUrl: z.string().nullable(),
});

const notificationSchema = z.discriminatedUnion("type", [
	notificationSchemaBase.extend({
		type: z.literal(notificationTypes.chatroom),
		chatroomId: z.number().int(),
		postId: z.null(),
	}),
	notificationSchemaBase.extend({
		type: z.literal(notificationTypes.post),
		chatroomId: z.null(),
		postId: z.number().int(),
	}),
]);

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
	notificationSchema,
	notificationsResponseSchema,
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
