import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { appDatabase } from '$lib/server/database';
import { analyseTextForBias } from '$lib/server/ai/gemini';

function requireUserId(locals: App.Locals): number {
	if (locals.userId == null) {
		throw error(401, 'Not signed in');
	}
	return locals.userId;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.userId == null) {
		redirect(303, '/login');
	}
	return {};
};

export const actions: Actions = {
	analyse: async ({ request, locals }) => {
		const data = await request.formData();
		const text = String(data.get('text') ?? '').trim();

		if (text.length < 50) {
			return {
				error: 'Text too short for meaningful analysis',
				input: text
			};
		}

		if (text.length > 10000) {
			return {
				error: 'Text exceeds analysis limit',
				input: text
			};
		}

		const userId = requireUserId(locals);

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 120_000);

		try {
			const result = await analyseTextForBias(text, controller.signal);
			clearTimeout(timeout);

			const biasTypeText =
				result.biasTypes && result.biasTypes.length > 0
					? result.biasTypes.join(', ')
					: 'No strong bias type detected';

			const sourcesText = result.claims
				.map((claim) => {
					const urls = claim.sources.map((s) => s.url).filter(Boolean);
					if (urls.length === 0) return '';
					return `${claim.claim_text}: ${urls.join(', ')}`;
				})
				.filter((line) => line.trim().length > 0)
				.join(' | ');

			const analysisId = appDatabase.createAnalysis(userId, text, {
				biasScore: result.biasScore,
				biasType: biasTypeText,
				summary: result.summary,
				sources: sourcesText
			});

			return {
				analysisId,
				result
			};
		} catch (err) {
			clearTimeout(timeout);
			let message =
				err instanceof Error
					? err.message
					: 'Analysis service temporarily unavailable. Please try again.';
			if (err instanceof Error && err.name === 'AbortError') {
				message =
					'Analysis timed out (2 minutes). Try shorter text or check your connection.';
			}
			console.error('[analyse]', err);

			return {
				error: message,
				input: text
			};
		}
	}
};

