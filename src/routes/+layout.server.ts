import type { LayoutServerLoad } from './$types';

/** Session comes from HTTP-only cookie + SQLite (see hooks.server.ts). */
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.userEmail ? { email: locals.userEmail } : null
	};
};
