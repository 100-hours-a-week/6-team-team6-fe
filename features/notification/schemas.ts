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

type WebPushSettingDto = z.infer<typeof webPushSettingSchema>;
type WebPushSettingUpdateDto = z.infer<typeof webPushSettingUpdateSchema>;
type PushTokenRegisterDto = z.infer<typeof pushTokenRegisterSchema>;

export {
	pushTokenPlatformSchema,
	pushTokenRegisterSchema,
	webPushSettingSchema,
	webPushSettingUpdateSchema,
};
export type { PushTokenRegisterDto, WebPushSettingDto, WebPushSettingUpdateDto };
