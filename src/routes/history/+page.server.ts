import type { PageServerLoad } from './$types';
import { appDatabase } from '$lib/server/database';

function requireUserId(): number {
	// This will be replaced by real session handling; for now it keeps the flow simple.
	return 1;
}

export const load: PageServerLoad = async () => {
	const userId = requireUserId();
	const analyses = appDatabase.getAnalysesForUser(userId);

	return {
		analyses
	};
};

