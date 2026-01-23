import Link from "next/link";

import type { RoomSummary } from "@/features/chat/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Typography } from "@/shared/components/ui/typography";

interface ChatRoomItemProps {
	room: RoomSummary;
}

export function ChatRoomItem(props: ChatRoomItemProps) {
	const { room } = props;

	return (
		<Link href={`/chat/${room.chatRoomId}`} className="w-full text-left">
			<div className="transition-colors hover:bg-muted/40 py-3">
				<div className="flex items-center gap-3">
					<Avatar size="xl">
						<AvatarImage
							src={room.chatPartnerAvatarUrl}
							alt={`${room.chatPartnerNickname} profile`}
						/>
						<AvatarFallback>{room.chatPartnerNickname.slice(0, 1)}</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<div className="flex items-center justify-between gap-2">
							<Typography type="subtitle" className="truncate">
								{room.chatPartnerNickname}
							</Typography>
							<Typography type="caption">{room.lastMessageAt}</Typography>
						</div>
						<div className="flex min-w-0 items-center justify-between gap-2">
							<Typography type="body-sm" className="truncate text-muted-foreground">
								{room.lastMessage}
							</Typography>
							{room.unreadCount > 0 ? (
								<Badge variant="product" className="h-5 min-w-5 justify-center px-1">
									{room.unreadCount}
								</Badge>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
