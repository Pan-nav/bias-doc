/**
 * auth.ts – Simple auth storage and logic for coursework.
 * Uses localStorage so we don't need a server. For production we would use a proper backend
 * and never store plain passwords.
 */

import { writable } from 'svelte/store';

const STORAGE_KEY = 'biasdoc_users';

export type User = {
	email: string;
	password: string;
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

/** Check if an email is already registered. Used to decide "login" vs "create account". */
export function userExists(email: string): boolean {
	const users = getUsers();
	const normalised = email.trim().toLowerCase();
	return users.some((u) => u.email.toLowerCase() === normalised);
}

/**
 * Create a new account and log the user in.
 * TODO: Add password hashing in production; plain storage is for coursework only.
 */
export function createAccount(email: string, password: string): void {
	const users = getUsers();
	const normalisedEmail = email.trim().toLowerCase();
	users.push({ email: normalisedEmail, password });
	saveUsers(users);
	currentUser.set({ email: normalisedEmail, password });
}

/**
 * Try to log in. Returns success flag and an error message if password is wrong.
 * We compare passwords in plain text for coursework; in production we would hash and compare hashes.
 */
export function login(email: string, password: string): { success: boolean; error?: string } {
	const users = getUsers();
	const normalisedEmail = email.trim().toLowerCase();
	const user = users.find((u) => u.email.toLowerCase() === normalisedEmail);
	if (!user) {
		return { success: false, error: 'Account does not exist' };
	}
	if (user.password !== password) {
		return { success: false, error: 'Invalid password' };
	}
	currentUser.set({ email: user.email, password: user.password });
	return { success: true };
}

export function logout(): void {
	currentUser.set(null);
}
