import { type MutableRefObject,useCallback, useEffect, useRef } from "react";

import type { Client } from "@stomp/stompjs";

import { STOMP_DESTINATION } from "@/features/chat/lib/constants";

type UsePendingStompQueueParams = {
	authHeader: string | null;
	chatroomId: number | null;
	submitMessage: (text: string) => void;
	stompClientRef: MutableRefObject<Client | null>;
	isStompConnectedRef: MutableRefObject<boolean>;
	myMembershipIdRef: MutableRefObject<number | null>;
};

type UsePendingStompQueueResult = {
	submitMessageByStomp: (text: string) => void;
	markAsReadByStomp: (readMessageId: string) => void;
	flushPendingMessages: () => void;
};

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

	const canPublishNow = useCallback(() => {
		const client = stompClientRef.current;
		return Boolean(
			authHeader &&
				chatroomId !== null &&
				client?.connected &&
				isStompConnectedRef.current &&
				myMembershipIdRef.current !== null,
		);
	}, [authHeader, chatroomId, isStompConnectedRef, myMembershipIdRef, stompClientRef]);

	const enqueuePendingMessage = useCallback((text: string) => {
		pendingMessagesRef.current = [...pendingMessagesRef.current, text];
		submitMessage(text);
	}, [submitMessage]);

	const publishMessage = useCallback((text: string) => {
		if (!canPublishNow() || !authHeader || chatroomId === null) {
			return false;
		}

		const membershipId = myMembershipIdRef.current;
		const client = stompClientRef.current;
		if (membershipId === null || !client || !client.connected) {
			return false;
		}

		client.publish({
			destination: STOMP_DESTINATION.send,
			headers: {
				Authorization: authHeader,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				chatroomId,
				message: text,
				membershipId,
			}),
		});

		return true;
	}, [authHeader, canPublishNow, chatroomId, myMembershipIdRef, stompClientRef]);

	const flushPendingMessages = useCallback(() => {
		if (!canPublishNow()) {
			return;
		}

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
	}, [canPublishNow, publishMessage]);

	const submitMessageByStomp = useCallback((text: string) => {
		if (!canPublishNow()) {
			enqueuePendingMessage(text);
			return;
		}

		const isPublished = publishMessage(text);
		if (!isPublished) {
			enqueuePendingMessage(text);
			return;
		}

		submitMessage(text);
	}, [canPublishNow, enqueuePendingMessage, publishMessage, submitMessage]);

	const markAsReadByStomp = useCallback((readMessageId: string) => {
		if (!authHeader || chatroomId === null || !isStompConnectedRef.current) {
			return;
		}

		const membershipId = myMembershipIdRef.current;
		const client = stompClientRef.current;
		if (!client || !client.connected || membershipId === null) {
			return;
		}

		client.publish({
			destination: STOMP_DESTINATION.read,
			headers: {
				Authorization: authHeader,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				chatroomId,
				membershipId,
				readMessageId,
			}),
		});
	}, [authHeader, chatroomId, isStompConnectedRef, myMembershipIdRef, stompClientRef]);

	return {
		submitMessageByStomp,
		markAsReadByStomp,
		flushPendingMessages,
	};
}
