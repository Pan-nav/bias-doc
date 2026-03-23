// Server load for History: requires a signed-in user and loads their saved analyses from SQLite.
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { appDatabase } from '$lib/server/database';

// Runs on every navigation to /history; unauthenticated visitors go to login.
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.userId == null) {
		redirect(303, '/login');
	}
	// Ordered by created_at (see database helper); same user_id as the session cookie.
	const analyses = appDatabase.getAnalysesForUser(locals.userId);

	return {
		analyses
	};
};

