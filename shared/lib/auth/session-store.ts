"use client";

import type { Session } from "next-auth";
import { getSession } from "next-auth/react";

let currentSession: Session | null = null;
let refreshPromise: Promise<Session | null> | null = null;

function setSession(session: Session | null) {
	currentSession = session;
}

function clearSession() {
	currentSession = null;
}

function getAccessToken() {
	return currentSession?.accessToken;
}

async function refreshSession() {
	if (refreshPromise) {
		return refreshPromise;
	}

	refreshPromise = getSession()
		.then((session) => {
			setSession(session ?? null);
			return session ?? null;
		})
		.finally(() => {
			refreshPromise = null;
		});

	return refreshPromise;
}

export { clearSession, getAccessToken, refreshSession, setSession };
