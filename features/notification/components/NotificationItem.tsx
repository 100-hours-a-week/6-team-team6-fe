"use client";

import { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import { EllipsisVerticalIcon, FileTextIcon, MessageCircleIcon } from "lucide-react";

import { groupRoutes } from "@/features/group/lib/groupRoutes";
import { notificationMessages, notificationTypes } from "@/features/notification/lib/constants";
import type { Notification } from "@/features/notification/schemas";
import { postRoutes } from "@/features/post/lib/postRoutes";

import { IconButton } from "@/shared/components/ui/icon-button";
import { Typography } from "@/shared/components/ui/typography";

import { formatRelativeTimeLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

interface NotificationItemProps {
	notification: Notification;
	onDeleteClick: (notification: Notification) => void;
	disabled?: boolean;
}

function NotificationItem(props: NotificationItemProps) {
	const { notification, onDeleteClick, disabled = false } = props;

	const href = useMemo(() => {
		if (notification.type === notificationTypes.chatroom && notification.chatroomId !== null) {
			return postRoutes.chatRoom(notification.chatroomId);
		}

		if (notification.type === notificationTypes.post && notification.postId !== null) {
			return groupRoutes.postDetail(notification.groupId, notification.postId);
		}

		return "/notifications";
	}, [notification]);

	const TypeIcon =
		notification.type === notificationTypes.chatroom ? MessageCircleIcon : FileTextIcon;
	const typeLabel = notificationMessages.typeLabels[notification.type];

	return (
		<div className="flex items-start gap-2 border-b border-border/70 px-3 py-3 hover:bg-secondary">
			<Link
				href={href}
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : undefined}
				onClick={(event) => {
					if (disabled) {
						event.preventDefault();
					}
				}}
				className={cn(
					"min-w-0 flex flex-1 items-center gap-3",
					disabled && "pointer-events-none opacity-70",
				)}
			>
				<div
					className={cn(
						"relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
					)}
				>
					{notification.postFirstImageUrl ? (
						<Image
							src={notification.postFirstImageUrl}
							alt={notification.title}
							fill
							sizes="40px"
							className="object-cover"
						/>
					) : (
						<>
							<TypeIcon className="size-5" aria-hidden="true" />
							<span className="sr-only">{typeLabel}</span>
						</>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<Typography type="body-sm" className="truncate-1 font-semibold text-foreground">
						{notification.title}
					</Typography>
					<Typography type="caption" className="mt-0.5 block truncate-1 text-muted-foreground">
						{notification.description}
					</Typography>
					<div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
						<Typography type="caption" className="min-w-0 truncate-1">
							{notification.groupName}
						</Typography>
						<span className="shrink-0 text-[10px] leading-none">·</span>
						<Typography type="caption" className="shrink-0">
							{formatRelativeTimeLabel(notification.createdAt)}
						</Typography>
					</div>
				</div>
			</Link>
			<div className="flex pt-1">
				<IconButton
					size="icon-touch"
					icon={<EllipsisVerticalIcon className="size-5" />}
					aria-label={`${notification.title} 알림 옵션 열기`}
					disabled={disabled}
					onClick={(event) => {
						event.stopPropagation();
						onDeleteClick(notification);
					}}
				/>
			</div>
		</div>
	);
}

function NotificationEmptyState() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl  px-6 text-center">
			<div className="flex flex-1 items-center justify-center px-4 py-6">
				<Typography type="body-sm" className="text-muted-foreground">
					{notificationMessages.empty}
				</Typography>
			</div>
		</div>
	);
}

export { NotificationEmptyState, NotificationItem };
export type { NotificationItemProps };
