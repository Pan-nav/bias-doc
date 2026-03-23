<script lang="ts">
	// History page: list past analyses from the server; clicking one rebuilds a slim GeminiAnalysisResult for AnalysisResult.
	import type { PageData } from './$types';
	import AnalysisResult from '$lib/components/AnalysisResult.svelte';
	import type { GeminiAnalysisResult } from '$lib/server/ai/gemini';

	// Svelte 5: page data from +page.server.ts load().
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// ID of the clicked row (for selection state; detail panel uses selectedSummary).
	let selectedId = $state<number | null>(null);
	// Shaped like a live Gemini response so AnalysisResult can render score, types line, and summary text.
	let selectedSummary = $state<GeminiAnalysisResult | null>(null);

	// DB rows only store flat strings; we fake biasTypes as one string and skip claims (not persisted as structured JSON).
	function handleSelect(analysis: any) {
		selectedId = analysis.id;
		const combinedSummary =
			analysis.sources && analysis.sources.length > 0
				? `${analysis.summary}\n\nSaved sources: ${analysis.sources}`
				: analysis.summary;
		selectedSummary = {
			biasScore: analysis.biasScore,
			// DB has no separate label field; left blank so the sky label line is empty on history (score bar still shows).
			biasLabel: '',
			// Single entry from stored bias_type text (may be comma-separated types saved as one field).
			biasTypes: analysis.biasType ? [analysis.biasType] : [],
			summary: combinedSummary,
			claims: []
		};
	}

	// Layout: scrollable list left; right panel shows AnalysisResult or placeholder until a row is chosen.
</script>

<div
	class="flex min-h-[calc(100vh-72px)] w-full items-start justify-center px-4 py-12 font-inter"
	style="background: radial-gradient(ellipse at bottom left, #00F3F9, #0034EB 30%, transparent 55%), #000;"
>
	<div class="flex w-full max-w-5xl flex-col gap-6 rounded-[15px] bg-black/80 px-8 py-10 shadow-xl">
		<header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white">History</h1>
				<p class="mt-1 text-sm text-gray-400">
					Review your previous analyses. Click an entry to see its bias rating again.
				</p>
			</div>
		</header>

		<div class="grid gap-8 md:grid-cols-[1.3fr,1.7fr]">
			<section class="max-h-[480px] space-y-3 overflow-y-auto pr-2">
				{#if data.analyses.length === 0}
					<p class="text-sm text-gray-400">
						You have not run any analyses yet. Once you analyse text on the dashboard, it will appear
						here.
					</p>
				{:else}
					{#each data.analyses as analysis}
						<button
							type="button"
							class="w-full rounded-[12px] border border-[#1f2937] bg-black/60 p-4 text-left text-sm
							 text-gray-200 transition hover:border-sky-500/80 hover:bg-black"
							onclick={() => handleSelect(analysis)}
						>
							<div class="flex items-center justify-between gap-3">
								<div class="flex flex-col">
									<span class="text-xs text-gray-400">
										{new Date(analysis.createdAt).toLocaleString()}
									</span>
									<span class="mt-1 line-clamp-2 text-sm text-gray-100">
										{analysis.inputText}
									</span>
								</div>
								<div class="shrink-0 rounded-full bg-sky-900/60 px-3 py-1 text-xs font-semibold text-sky-300">
									{analysis.biasScore}/10
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</section>

			<section>
				{#if selectedSummary}
					<AnalysisResult result={selectedSummary} />
				{:else}
					<p class="mt-4 text-sm text-gray-400">
						Select an analysis from the list to view its summary.
					</p>
				{/if}
			</section>
		</div>
	</div>
</div>

