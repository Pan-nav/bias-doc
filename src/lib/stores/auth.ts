/**
 * Client-side session state only (who is logged in for UI).
 * Users and passwords live in SQLite; session is an HTTP-only cookie set by /api/auth.
 */

import { invalidateAll } from '$app/navigation';
import { writable } from 'svelte/store';

export type User = {
	email: string;
};

export const currentUser = writable<User | null>(null);

async function postAuth(body: Record<string, string>) {
	const res = await fetch('/api/auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return res.json();
}

/** Check if an email is already registered (SQLite). */
export async function userExists(email: string): Promise<boolean> {
	const data = await postAuth({ action: 'userExists', email: email.trim().toLowerCase() });
	return Boolean(data?.exists);
}

/** Create account in SQLite and set session cookie. */
export async function createAccount(
	email: string,
	password: string
): Promise<{ ok: boolean; error?: string }> {
	const data = await postAuth({
		action: 'register',
		email: email.trim().toLowerCase(),
		password
	});
	if (data?.ok) {
		currentUser.set({ email: email.trim().toLowerCase() });
		return { ok: true };
	}
	return { ok: false, error: data?.error ?? 'Could not create account' };
}

/** Log in against SQLite; server sets session cookie. */
export async function login(
	email: string,
	password: string
): Promise<{ success: boolean; error?: string }> {
	const data = await postAuth({
		action: 'login',
		email: email.trim().toLowerCase(),
		password
	});
	if (data?.success) {
		currentUser.set({ email: email.trim().toLowerCase() });
		return { success: true };
	}
	return { success: false, error: data?.error ?? 'Login failed' };
}

/** Clear session cookie and client store. */
export async function logout(): Promise<void> {
	await fetch('/api/auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'logout' })
	});
	currentUser.set(null);
	await invalidateAll();
}

/** Sync store from server (call after layout load or on navigation). */
export function setUserFromSession(user: User | null): void {
	currentUser.set(user);
}
