<script lang="ts">
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import AnalysisResult from '$lib/components/AnalysisResult.svelte';
	import type { GeminiAnalysisResult } from '$lib/server/ai/gemini';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { currentUser, logout } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	/**
	 * Dashboard – shown after successful login.
	 * If the user is not in the store (e.g. they refreshed), we redirect back to login.
	 */

	let user = $state<{ email: string } | null>(null);

	onMount(() => {
		user = get(currentUser);
		if (user === null) {
			goto('/login');
			return;
		}
		const unsub = currentUser.subscribe((u) => { user = u; });
		return unsub;
	});

	function handleLogout() {
		logout();
		goto('/login');
	}

	//storing the necessary input, processing and potential output data
	let text = $state('');
	let errorMessage = $state<string | null>(null);
	let isSubmitting = $state(false);
	let latestResult = $state<GeminiAnalysisResult | null>(null);

	type AnalyseActionData = {
		error?: string;
		result?: GeminiAnalysisResult;
	};

	let charCount = $derived(text.length);
	let canAnalyse = $derived(charCount > 50 && charCount < 10000 && !isSubmitting);

	/** Kept in script so TypeScript `as` works (markup attribute expressions are plain JS). */
	const enhanceAnalyse = ({
		formElement
	}: {
			action: URL;
			formData: FormData;
			formElement: HTMLFormElement;
			controller: AbortController;
			submitter: HTMLElement | null;
			cancel: () => void;
		}) => {
		return async ({
			result,
			update
		}: {
			result: ActionResult;
			reset?: boolean;
			update: (options?: { reset?: boolean }) => Promise<void>;
		}) => {
			errorMessage = null;
			isSubmitting = true;
			try {
				if (result.type === 'success' && result.data) {
					const data = result.data as AnalyseActionData;
					if (data.error) {
						errorMessage = data.error;
						latestResult = null;
					} else if (data.result) {
						latestResult = data.result;
					}
				}
				await update();
			} finally {
				isSubmitting = false;
				const el = formElement.elements.namedItem('text');
				text = el instanceof HTMLTextAreaElement ? el.value : text;
			}
		};
	};
</script>

<!-- The central element with the welcome text and place to paste input-->
<div
	class="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-6 py-16 font-inter"
	style="background: radial-gradient(ellipse at bottom left, #00F3F9, #0034EB 30%, transparent 55%), #000;"
>
	<div class="flex w-full max-w-6xl flex-col gap-10 rounded-[18px] bg-black/80 px-10 py-12 shadow-xl justify-center">
		<header class="flex flex-col items-center gap-3">
			<div class="text-center max-w-3xl">
				<h1 class="text-3xl font-bold text-white">Welcome back</h1>
				<p class="mt-2 text-base text-gray-400">
					Paste an article or social media post below and Doctor will analyse it for bias and
					misinformation.
				</p>
			</div>
		</header>

		<form method="POST" action="?/analyse" use:enhance={enhanceAnalyse} class="flex flex-col gap-4">
			<div>
				<label for="analysis-text" class="text-base font-medium text-white">
					Text to analyse
				</label>
				<textarea
					id="analysis-text"
					name="text"
					bind:value={text}
					rows="8"
					class="mt-3 w-full resize-none rounded-[14px] border border-[#374151] bg-[#0f0f0f] px-5 py-4 text-sm
					text-white placeholder-gray-500 focus:outline-none"
					placeholder="Paste article or post content here (50–10000 characters)..."
				></textarea>
				<div class="mt-2 flex items-center justify-between text-xs text-gray-400">
					<span>
						{#if charCount < 50}
							Minimum 50 characters for meaningful analysis.
						{:else if charCount > 10000}
							Text exceeds the 10000 character analysis limit.
						{:else}
							Text length looks good.
						{/if}
					</span>
					<span>{charCount}/10000</span>
				</div>
			</div>

			{#if errorMessage}
				<div class="rounded-[10px] border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
					{errorMessage}
				</div>
			{/if}

			<div class="mt-4 flex w-full justify-center">
				<div class="w-full">
					<PrimaryButton
						type="submit"
						label={isSubmitting ? 'Analysing…' : 'Analyse text'}
						disabled={!canAnalyse}
						fullWidth
					/>
				</div>
			</div>
		</form>

		<AnalysisResult result={latestResult} />
	</div>
</div>
