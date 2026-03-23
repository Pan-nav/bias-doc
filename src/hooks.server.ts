import type { Handle } from '@sveltejs/kit';
import { appDatabase } from '$lib/server/database';

const AUTH_COOKIE = 'auth_user_id';

export const handle: Handle = async ({ event, resolve }) => {
	const idStr = event.cookies.get(AUTH_COOKIE);
	let userId: number | null = null;
	let userEmail: string | null = null;

	if (idStr) {
		const id = parseInt(idStr, 10);
		if (!Number.isNaN(id)) {
			const user = appDatabase.getUserById(id);
			if (user) {
				userId = user.id;
				userEmail = user.email;
			} else {
				event.cookies.delete(AUTH_COOKIE, { path: '/' });
			}
		}
	}

	event.locals.userId = userId;
	event.locals.userEmail = userEmail;

	return resolve(event);
};
