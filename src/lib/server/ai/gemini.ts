/**
 * Google Gemini integration for bias analysis.
 * Calls the REST API from the server only (API key stays in .env, never sent to the browser).
 */
import { env } from '$env/dynamic/private';

// Fixed set of bias category tags we ask the model to use 
type GeminiBiasType =
	| 'political_left'
	| 'political_right'
	| 'emotional_manipulation'
	| 'cherry_picking'
	| 'loaded_language'
	| 'appeal_to_emotion';

// One cited source attached to a claim (title, URL, stance, short credibility note). 
export type GeminiSource = {
	title: string;
	url: string;
	stance: 'supports' | 'refutes' | 'mixed';
	credibility: string;
};

// A factual claim extracted from the text plus supporting/refuting sources. 
export type GeminiClaim = {
	claim_text: string;
	search_query: string;
	stance: 'supports' | 'refutes' | 'mixed';
	sources: GeminiSource[];
};

// Normalised result we pass to the UI and save to the database after a successful API call. 
export type GeminiAnalysisResult = {
	biasScore: number;
	biasLabel: string;
	biasTypes: GeminiBiasType[];
	summary: string;
	claims: GeminiClaim[];
};

// Shape of the JSON object we expect back from the model (snake_case keys match the prompt). 
type RawGeminiResponse = {
	bias_score: number;
	bias_label: string;
	bias_types: GeminiBiasType[];
	explanation: string;
	claims: GeminiClaim[];
};

// Reads GEMINI_MODEL from .env (set in project root; trim whitespace)
function getModel(): string {
	return env.GEMINI_MODEL.trim();
}

/**
 * The model sometimes wraps JSON in markdown code fences (` ```json ... ``` `).
 * This pulls out the JSON object substring so JSON.parse can succeed.
 */
function extractJsonString(raw: string): string {
	const t = raw.trim();
	if (t.includes('```')) {
		const parts = t.split('```');
		for (const p of parts) {
			const s = p.replace(/^json\s*/i, '').trim();
			if (s.startsWith('{')) {
				const end = s.lastIndexOf('}');
				if (end !== -1) return s.slice(0, end + 1);
			}
		}
	}
	const start = t.indexOf('{');
	const end = t.lastIndexOf('}');
	if (start !== -1 && end > start) return t.slice(start, end + 1);
	return t;
}

/**
 * Sends user text to Gemini with a strict JSON-only prompt, then uses it to form 	 GeminiAnalysisResult.
 * Error if the API key is missing, HTTP fails, the response is blocked, or JSON is invalid.
 */
export async function analyseTextForBias(inputText: string, signal?: AbortSignal): Promise<GeminiAnalysisResult> {
	const apiKey = env.GEMINI_API_KEY?.trim();
	if (!apiKey) {
		throw new Error(
			'Missing GEMINI_API_KEY. Create a file named .env in the project root with: GEMINI_API_KEY=your_key'
		);
	}

	const prompt = [
		'You are analysing a piece of text for bias and factual reliability.',
		'Return ONLY valid JSON – no markdown, no comments.',
		'The JSON shape must be:',
		'{',
		'  "bias_score": integer 1-10,',
		'  "bias_label": "Left-biased" | "Fairly neutral" | "Right-biased",',
		'  "bias_types": string[],',
		'  "explanation": string,',
		'  "claims": [',
		'    {',
		'      "claim_text": string,',
		'      "search_query": string,',
		'      "stance": "supports" | "refutes" | "mixed",',
		'      "sources": [',
		'        { "title": string, "url": string, "stance": "supports" | "refutes" | "mixed", "credibility": string }',
		'      ]',
		'    }',
		'  ]',
		'}',
		'Scoring rules (you MUST follow these exactly; the app uses the same bands):',
		'- bias_score 1–4 = left-leaning framing or political slant (stronger left as the number approaches 1).',
		'- bias_score 5–6 = fairly balanced or only mild lean either way.',
		'- bias_score 7–10 = right-leaning framing or political slant (stronger right as the number approaches 10).',
		'- bias_label MUST match bias_score: use "Left-biased" only if bias_score is 1–4, "Fairly neutral" only if 5–6, "Right-biased" only if 7–10.',
		'- The explanation must describe the same lean as bias_score and bias_label (do not contradict them).',
		'Bias types must be chosen from:',
		'["political_left","political_right","emotional_manipulation","cherry_picking","loaded_language","appeal_to_emotion"].',
		'For sources, only use well-known, reputable domains (for example BBC, Reuters, AP, major newspapers, academic or' +
		' government sites).',
		'Every claim should have between 1 and 3 sources with real, working URLs.',
		'Keep the explanation short and written for a non-technical adult reader.',
		'Text to analyse:',
		inputText
	].join('\n');

	const model = getModel();
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
		{
			method: 'POST',
			signal,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [{ text: prompt }]
					}
				],
				generationConfig: {
					temperature: 0.4,
					maxOutputTokens: 4096
				}
			})
		}
	);

	if (!response.ok) {
		const errBody = await response.json().catch(() => ({}));
		const msg =
			(errBody as { error?: { message?: string; status?: string } })?.error?.message ||
			JSON.stringify(errBody).slice(0, 300);
		throw new Error(`Gemini API ${response.status}: ${msg}`);
	}

	const data = (await response.json()) as {
		error?: { message?: string };
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
		promptFeedback?: { blockReason?: string };
	};

	if (data.error?.message) {
		throw new Error(`Gemini API: ${data.error.message}`);
	}

	const blockReason = data.promptFeedback?.blockReason;
	if (blockReason) {
		throw new Error(`Request blocked by safety settings (${blockReason}). Try shorter or different text.`);
	}

	const candidate = data.candidates?.[0];
	const finish = candidate?.finishReason;
	if (finish === 'SAFETY' || finish === 'RECITATION' || finish === 'OTHER') {
		throw new Error(
			`Gemini could not complete the response (${finish}). Try different text or adjust safety settings in Google AI Studio.`
		);
	}

	const text = candidate?.content?.parts?.[0]?.text;
	if (!text || typeof text !== 'string') {
		throw new Error(
			'Gemini returned no text (empty candidates). Check API key, model name (GEMINI_MODEL), and billing.'
		);
	}

	const jsonStr = extractJsonString(text);

	let parsed: RawGeminiResponse;
	try {
		parsed = JSON.parse(jsonStr) as RawGeminiResponse;
	} catch {
		throw new Error(
			'Gemini did not return parseable JSON. First 200 chars: ' + jsonStr.slice(0, 200).replace(/\s+/g, ' ')
		);
	}

	const score = typeof parsed.bias_score === 'number' ? parsed.bias_score : 0;

	let label: string;
	if (score <= 4) {
		label = 'Left-biased';
	} else if (score <= 6) {
		label = 'Fairly neutral';
	} else {
		label = 'Right-biased';
	}

	return {
		biasScore: Math.min(Math.max(Math.round(score), 1), 10),
		biasLabel: parsed.bias_label || label,
		biasTypes: parsed.bias_types ?? [],
		summary: parsed.explanation ?? '',
		claims: parsed.claims ?? []
	};
}
