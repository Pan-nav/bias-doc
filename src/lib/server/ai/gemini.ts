import { env } from '$env/dynamic/private';

type GeminiBiasType =
	| 'political_left'
	| 'political_right'
	| 'emotional_manipulation'
	| 'cherry_picking'
	| 'loaded_language'
	| 'appeal_to_emotion';

export type GeminiSource = {
	title: string;
	url: string;
	stance: 'supports' | 'refutes' | 'mixed';
	credibility: string;
};

export type GeminiClaim = {
	claim_text: string;
	search_query: string;
	stance: 'supports' | 'refutes' | 'mixed';
	sources: GeminiSource[];
};

export type GeminiAnalysisResult = {
	biasScore: number;
	biasLabel: string;
	biasTypes: GeminiBiasType[];
	summary: string;
	claims: GeminiClaim[];
};

type RawGeminiResponse = {
	bias_score: number;
	bias_label: string;
	bias_types: GeminiBiasType[];
	explanation: string;
	claims: GeminiClaim[];
};

const MODEL = 'gemini-2.5-flash';

export async function analyzeTextForBias(inputText: string, signal?: AbortSignal): Promise<GeminiAnalysisResult> {
	const apiKey = env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured on the server.');
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
		'Bias types must be chosen from:',
		'["political_left","political_right","emotional_manipulation","cherry_picking","loaded_language","appeal_to_emotion"].',
		'For sources, only use well-known, reputable domains (for example BBC, Reuters, AP, major newspapers, academic or government sites).',
		'Every claim should have between 1 and 3 sources with real, working URLs.',
		'Keep the explanation short and written for a non-technical adult reader.',
		'Text to analyse:',
		inputText
	].join('\n');

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
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
					maxOutputTokens: 800
				}
			})
		}
	);

	if (!response.ok) {
		throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
	}

	const data = (await response.json()) as any;
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text || typeof text !== 'string') {
		throw new Error('Gemini API did not return text content in the expected format.');
	}

	let parsed: RawGeminiResponse;
	try {
		parsed = JSON.parse(text) as RawGeminiResponse;
	} catch (err) {
		throw new Error('Gemini API returned invalid JSON.');
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

