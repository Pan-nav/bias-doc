import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
	throw redirect(303, '/login');
};

export const actions: Actions = {
	default: async () => {
		throw redirect(303, '/login');
	}
};

