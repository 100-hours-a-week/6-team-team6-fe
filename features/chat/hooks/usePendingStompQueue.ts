import { type RefObject, useCallback, useEffect, useRef } from "react";

import type { Client } from "@stomp/stompjs";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";
import { buildStompJsonHeaders } from "@/features/chat/lib/stomp";

type UsePendingStompQueueParams = {
	authHeader: string | null;
	chatroomId: number | null;
	submitMessage: (text: string) => void;
	stompClientRef: RefObject<Client | null>;
	isStompConnectedRef: RefObject<boolean>;
	myMembershipIdRef: RefObject<number | null>;
};

type UsePendingStompQueueResult = {
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	flushPendingMessages: () => void;
};

type PublishContext = {
	client: Client;
	membershipId: number;
};

type StompBodyFactory = (membershipId: number) => Record<string, unknown>;

export function usePendingStompQueue(
	params: UsePendingStompQueueParams,
): UsePendingStompQueueResult {
	const {
		authHeader,
		chatroomId,
		submitMessage,
		stompClientRef,
		isStompConnectedRef,
		myMembershipIdRef,
	} = params;

	const pendingMessagesRef = useRef<string[]>([]);

	useEffect(() => {
		pendingMessagesRef.current = [];
	}, [chatroomId]);

	const getPublishContext = useCallback((): PublishContext | null => {
		const client = stompClientRef.current;
		const membershipId = myMembershipIdRef.current;
		if (!client || !client.connected || !isStompConnectedRef.current || membershipId === null) {
			return null;
		}

		return { client, membershipId };
	}, [isStompConnectedRef, myMembershipIdRef, stompClientRef]);

	const enqueuePendingMessage = useCallback(
		(text: string) => {
			pendingMessagesRef.current = [...pendingMessagesRef.current, text];
			submitMessage(text);
		},
		[submitMessage],
	);

	const publishWithMembership = useCallback(
		(destination: string, buildBody: StompBodyFactory) => {
			if (!authHeader || chatroomId === null) {
				return false;
			}

			const publishContext = getPublishContext();
			if (!publishContext) {
				return false;
			}

			publishContext.client.publish({
				destination,
				headers: buildStompJsonHeaders(authHeader),
				body: JSON.stringify(buildBody(publishContext.membershipId)),
			});

			return true;
		},
		[authHeader, chatroomId, getPublishContext],
	);

	const publishMessage = useCallback(
		(text: string) => {
			return publishWithMembership(STOMP_DESTINATION.send, (membershipId) => ({
				chatroomId,
				message: text,
				membershipId,
			}));
		},
		[chatroomId, publishWithMembership],
	);

	const flushPendingMessages = useCallback(() => {
		const pendingMessages = pendingMessagesRef.current;
		if (pendingMessages.length === 0) {
			return;
		}

		pendingMessagesRef.current = [];
		for (const [index, pendingMessage] of pendingMessages.entries()) {
			const isPublished = publishMessage(pendingMessage);
			if (!isPublished) {
				pendingMessagesRef.current = pendingMessages.slice(index);
				break;
			}
		}
	}, [publishMessage]);

	const submitMessageByStomp = useCallback(
		(text: string) => {
			const isPublished = publishMessage(text);
			if (!isPublished) {
				enqueuePendingMessage(text);
				return;
			}

			submitMessage(text);
		},
		[enqueuePendingMessage, publishMessage, submitMessage],
	);

	const markAsReadByStomp = useCallback(
		(readMessageId: string) => {
			void publishWithMembership(STOMP_DESTINATION.read, (membershipId) => ({
				chatroomId,
				membershipId,
				readMessageId,
			}));
		},
		[chatroomId, publishWithMembership],
	);

	return {
		submitMessageByStomp,
		markAsReadByStomp,
		flushPendingMessages,
	};
}
