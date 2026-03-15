/**
 * Auth API – runs only on the server so SQLite (better-sqlite3) can access the database file.
 * The login page calls this instead of localStorage so user data lives in the Users table.
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appDatabase } from '$lib/server/database';

export const POST: RequestHandler = async ({ request }) => {
	let body: { action?: string; email?: string; password?: string };
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON');
	}
	const action = body.action;
	const email = body.email?.trim() ?? '';
	const password = body.password ?? '';

	if (!email) {
		throw error(400, 'Email required');
	}

	if (action === 'userExists') {
		return json({ exists: appDatabase.userExists(email) });
	}

	if (action === 'register') {
		if (!password) throw error(400, 'Password required');
		try {
			// Coursework: password stored in password_hash column as plain text for prototype.
			appDatabase.createUser({ email, passwordHash: password });
			return json({ ok: true });
		} catch (e) {
			return json({ ok: false, error: 'Could not create account' }, { status: 400 });
		}
	}

	if (action === 'login') {
		if (!password) throw error(400, 'Password required');
		const user = appDatabase.findUserByEmail(email);
		if (!user) {
			return json({ success: false, error: 'Account does not exist' });
		}
		if (user.passwordHash !== password) {
			return json({ success: false, error: 'Invalid password' });
		}
		return json({ success: true });
	}

	throw error(400, 'Unknown action');
};
