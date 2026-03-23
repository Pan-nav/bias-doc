<script lang="ts">
	// Shows bias score, types, summary, and claim-level source links from a Gemini analysis.
	import type { GeminiAnalysisResult } from '$lib/server/ai/gemini';

	// When null, nothing is rendered; dashboard passes the API result here after analyse succeeds.
	export let result: GeminiAnalysisResult | null = null;

	// Markup map: two-column grid — left: score bar + bias types + summary; right: verification blurb + each claim card
	// Score bar width = (biasScore/10)*100%; gradient left→right for visual intensity.
	// Bias type strings use replaceAll('_',' ') for readable labels.
	// Each claim lists sources with stance + credibility; empty arrays show fallback copy.
</script>

{#if result}
	<div class="mt-10 grid gap-6 rounded-[15px] border border-[#1f2937] bg-black/80 p-6 text-white md:grid-cols-[2fr,1.4fr]">
		<div class="flex flex-col gap-4">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Bias Rating</p>
				<div class="mt-2 flex items-center gap-3">
					<div class="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
						<div>
							class="absolute left-0 top-0 h-full rounded-full"
							style={`width: ${(result.biasScore / 10) * 100}%; background: linear-gradient(90deg,#22c55e,#eab308,#ef4444);`}
						</div>
					</div>
					<span class="text-sm font-semibold">{result.biasScore} / 10</span>
				</div>
				<p class="mt-1 text-sm font-medium text-sky-400">{result.biasLabel}</p>
			</div>

			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Type of Bias Detected</p>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-200">
					{#if result.biasTypes.length === 0}
						<li>No strong bias patterns detected.</li>
					{:else}
						{#each result.biasTypes as type}
							<li>{type.replaceAll('_', ' ')}</li>
						{/each}
					{/if}
				</ul>
			</div>

			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Explanation</p>
				<p class="mt-2 text-sm text-gray-200">
					{result.summary}
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<!-- Intro blurb when there are zero vs some claims -->
			<div class="rounded-[15px] border border-[#1f2937] bg-[#020617] p-4">
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Source Verification</p>
				{#if result.claims.length === 0}
					<p class="mt-2 text-sm text-gray-300">
						No specific factual claims were identified in this text.
					</p>
				{:else}
					<p class="mt-2 text-sm text-gray-300">
						The AI highlighted several key claims and suggested external sources for each one.
					</p>
				{/if}
			</div>

			{#each result.claims as claim, index}
				<div class="rounded-[15px] border border-[#1f2937] bg-[#020617] p-4">
					<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
						Claim {index + 1}
					</p>
					<p class="mt-1 text-sm font-medium text-gray-100">
						{claim.claim_text}
					</p>
					<p class="mt-1 text-xs text-gray-400">
						Stance: {claim.stance}
					</p>

					{#if claim.sources.length > 0}
						<ul class="mt-3 space-y-2 text-sm">
							{#each claim.sources as source}
								<li class="rounded-lg bg-black/40 p-2">
									<a
										href={source.url}
										target="_blank"
										rel="noopener noreferrer"
										class="font-semibold text-sky-400 hover:underline"
									>
										{source.title}
									</a>
									<p class="text-xs text-gray-400">
										Stance: {source.stance} • Credibility: {source.credibility}
									</p>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="mt-3 text-xs text-gray-400">No concrete sources were suggested for this claim.</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

