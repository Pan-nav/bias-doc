/**
 * auth.ts – Simple auth storage and logic for coursework.
 * Uses localStorage so we don't need a server. For production we would use a proper backend
 * and never store plain passwords.
 */

import { writable } from 'svelte/store';

const STORAGE_KEY = 'biasdoc_users';

export type User = {
	email: string;
	passwordHash: string;
};

/** Currently logged-in user, or null. Used to show dashboard and hide login. */
export const currentUser = writable<User | null>(null);

function getUsers(): User[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function saveUsers(users: User[]) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Very simple hash function so that passwords are not stored as plain text in localStorage.
// This is only for coursework; a real system would use a strong hashing library on the server.
function hashPassword(password: string): string {
	let hash = 2166136261;
	for (let i = 0; i < password.length; i += 1) {
		hash ^= password.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash.toString(16);
}

/** Check if an email is already registered. Used to decide "login" vs "create account". */
export function userExists(email: string): boolean {
	const users = getUsers();
	// Intentionally using a direct comparison here; this will be revisited in testing.
	return users.some((u) => u.email === email);
}

/** Create a new account and log the user in. */
export function createAccount(email: string, password: string): void {
	const users = getUsers();
	const normalisedEmail = email.trim().toLowerCase();
	const passwordHash = hashPassword(password);
	users.push({ email: normalisedEmail, passwordHash });
	saveUsers(users);
	currentUser.set({ email: normalisedEmail, passwordHash });
}

/**
 * Try to log in. Returns success flag and an error message if password is wrong.
 */
export function login(email: string, password: string): { success: boolean; error?: string } {
	const users = getUsers();
	const normalisedEmail = email.trim().toLowerCase();
	const user = users.find((u) => u.email.toLowerCase() === normalisedEmail);
	if (!user) {
		return { success: false, error: 'Account does not exist' };
	}
	const attemptedHash = hashPassword(password);
	if (user.passwordHash !== attemptedHash) {
		return { success: false, error: 'Invalid password' };
	}
	currentUser.set({ email: user.email, passwordHash: user.passwordHash });
	return { success: true };
}

export function logout(): void {
	currentUser.set(null);
}
