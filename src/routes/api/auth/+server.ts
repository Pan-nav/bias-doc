/**
 * Auth API – SQLite only. Sets HTTP-only session cookie (not localStorage).
 */
import { json, error } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appDatabase } from '$lib/server/database';

const AUTH_COOKIE = 'auth_user_id';
const COOKIE_OPTS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: 60 * 60 * 24 * 7
};

function setSessionCookie(cookies: Cookies, userId: number) {
	cookies.set(AUTH_COOKIE, String(userId), COOKIE_OPTS);
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	let body: { action?: string; email?: string; password?: string };
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON');
	}
	const action = body.action;
	const email = body.email?.trim() ?? '';
	const password = body.password ?? '';

	if (action === 'logout') {
		cookies.delete(AUTH_COOKIE, { path: '/' });
		return json({ ok: true });
	}

	if (!email) {
		throw error(400, 'Email required');
	}

	if (action === 'userExists') {
		return json({ exists: appDatabase.userExists(email) });
	}

	if (action === 'register') {
		if (!password) throw error(400, 'Password required');
		try {
			const id = appDatabase.createUser({ email, password });
			setSessionCookie(cookies, id);
			return json({ ok: true });
		} catch {
			return json({ ok: false, error: 'Could not create account' }, { status: 400 });
		}
	}

	if (action === 'login') {
		if (!password) throw error(400, 'Password required');
		const user = appDatabase.findUserByEmail(email);
		if (!user) {
			return json({ success: false, error: 'Account does not exist' });
		}
		if (user.password !== password) {
			return json({ success: false, error: 'Invalid password' });
		}
		setSessionCookie(cookies, user.id);
		return json({ success: true });
	}

	throw error(400, 'Unknown action');
};
