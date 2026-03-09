<script lang="ts">
	/**
	 * Landing page for BiasDoc – Bias & Misinformation Detector.
	 * Uses Svelte transitions (fade, fly) for subtle animations on load – chosen over CSS-only
	 * because Svelte's transition are easier to implement in the component focused structure.
	 * Reusable components (StatCard, FeatureCard, etc.) are imported from $lib to keep this
	 * file focused on layout and data.
	 */

	import { fade, fly } from 'svelte/transition';
	import { FeatureCard, HowItWorksStep, StatCard, PrimaryButton } from '$lib';

	/** Statistic cards in "The Problem" section. Type ensures label and value are always provided. */
	type LandingStatistic = {
		label: string;
		value: string;
	};

	const keyStatistics: LandingStatistic[] = [
		{ label: 'Misinfo', value: '73%' },
		{ label: 'To Verify', value: '20 mins' },
		{ label: 'With AI', value: '6 sec' },
	];

	/** Feature labels for the 6-card grid. Stored in an array so we can loop with {#each} and avoid repetition. */
	const featureCards = [
		'Bias Detection',
		'Source Verify',
		'History Save',
		'Lightning Fast',
		'Free Forever',
		'Privacy First',
	];
</script>

<div>
	<div
		id="hero"
		class="relative flex min-h-[820px] items-center justify-center bg-black bg-cover bg-center bg-no-repeat"
		style="background-image: url('/Dark Gradient 06.png');"
	>
		<div class="mx-auto flex max-w-3xl flex-col items-center px-8 py-24 text-center" in:fade={{ duration: 450 }}>
			<h1
				class="whitespace-nowrap font-poppins text-[45px] font-extrabold leading-[auto] tracking-normal text-white"
				in:fade={{ duration: 450 }}
			>
				Stop Falling For Misinformation
			</h1>
			<p
				class="mt-2 whitespace-nowrap font-poppins text-[45px] font-extrabold leading-[auto] tracking-normal text-[#1898F4]"
				in:fade={{ delay: 50, duration: 450 }}
			>
				AI-Powered Bias Detection In Seconds
			</p>

			<p
				class="mt-6 max-w-[654px] font-poppins text-sm font-medium leading-relaxed text-[#A6A6A6]"
				in:fade={{ delay: 100, duration: 450 }}
			>
				Honestly, it's so easy to get sucked into stuff online that sounds legit but isn't. BiasDoc
				helps you spot the bias and check the facts before you share or believe it.
			</p>

			<div
				class="mt-5 flex items-center gap-4 font-inter text-sm font-bold leading-5 tracking-normal text-white"
				in:fade={{ delay: 150, duration: 450 }}
			>
				<div class="flex items-center gap-2">
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1898F4] text-[10px] leading-none text-black"
						aria-hidden="true"
					>
						✓
					</span>
					<span>No credit card</span>
				</div>
				<div class="flex items-center gap-2">
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1898F4] text-[10px] leading-none text-black"
						aria-hidden="true"
					>
						✓
					</span>
					<span>Free forever</span>
				</div>
			</div>

			<!-- Standard CTA button: links to login/signup -->
			<div class="mt-8" in:fly={{ y: 20, duration: 400 }}>
				<PrimaryButton label="Get Started Free" href="/login" />
			</div>
		</div>
	</div>

	<!-- PROBLEM SECTION -->
	<div id="problem" class="bg-black py-28">
		<div class="mx-auto max-w-6xl px-8">
			<div class="text-center" in:fade={{ duration: 400 }}>
				<h2 class="font-inter text-[32px] font-bold tracking-normal text-white">
					The Problem with <span class="text-[#1898F4]">Online Info</span>
				</h2>
				<p class="mt-3 max-w-[654px] mx-auto font-poppins text-sm font-medium text-[#A6A6A6]">
					Fake news, slanted headlines and stuff that just feels off? BiasDoc breaks
					it down so you know what's really going on.
				</p>
			</div>

			<!-- keyStatistics loop: stat.label used as key so Svelte can track items if order changes. -->
			<div class="mt-10 grid grid-cols-3 justify-items-center gap-6">
				{#each keyStatistics as stat (stat.label)}
					<StatCard label={stat.label} value={stat.value} />
				{/each}
			</div>
		</div>
	</div>

	<!-- HOW IT WORKS SECTION -->
	<div id="how-it-works" class="border-y border-white/5 bg-black py-28">
		<div class="mx-auto max-w-5xl px-8">
			<div class="text-center" in:fade={{ duration: 400 }}>
				<h2 class="font-inter text-[32px] font-bold tracking-normal text-white">
					How <span class="text-[#1898F4]">Bias Doctor Works</span>
				</h2>
				<p class="mt-3 mx-auto max-w-[654px] font-poppins text-sm font-medium text-[#A6A6A6]">
					Paste any text, get a clear breakdown. No jargon, no confusion- just straight-up answers
					so you can make up your own mind.
				</p>
			</div>

			<!-- Diagram: 3 blue circles connected by horizontal lines, labels below -->
			<div class="relative mt-12 flex items-start justify-center">
				<div class="flex items-start gap-0">
					<div class="flex flex-col items-center">
						<HowItWorksStep stepNumber={1} label="Paste" />
					</div>
					<div class="mt-6 h-0.5 w-24 shrink-0 bg-[#1898F4]" aria-hidden="true"></div>
					<div class="flex flex-col items-center">
						<HowItWorksStep stepNumber={2} label="AI Analyses" />
					</div>
					<div class="mt-6 h-0.5 w-24 shrink-0 bg-[#1898F4]" aria-hidden="true"></div>
					<div class="flex flex-col items-center">
						<HowItWorksStep stepNumber={3} label="Get Results" />
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- FEATURES SECTION -->
	<div id="features" class="bg-black py-28">
		<div class="mx-auto max-w-6xl px-8">
			<div class="text-center" in:fade={{ duration: 400 }}>
				<h2 class="font-inter text-[32px] font-bold tracking-normal text-white">
					Powerful features, <span class="text-[#1898F4]">Zero Cost</span>
				</h2>
				<p class="mt-3 mx-auto max-w-[654px] font-poppins text-sm font-medium text-[#A6A6A6]">
					Everything you need to stay informed- without paying a penny or dealing with annoying
					ads. Just clean, simple tools that actually help.
				</p>
			</div>

			<!-- featureCards: title as key ensures correct DOM updates when iterating. -->
			<div class="mt-10 grid grid-cols-3 justify-items-center gap-6">
				{#each featureCards as title (title)}
					<FeatureCard {title} />
				{/each}
			</div>
		</div>
	</div>

	<!-- Final Call to Action to encourage user to sign up-->
	<div id="start" class="bg-black py-28">
		<div class="mx-auto flex max-w-[1200px] flex-col items-center rounded-[15px] px-12 py-16 text-center" style="min-height: 260px; background: linear-gradient(90deg, #1856F4 0%, #1898F4 21%, #6C5EAE 100%);">
			<h2 class="font-poppins text-[45px] font-extrabold tracking-normal text-white" in:fade={{ duration: 450 }}>
				Ready To Stop Misinformation?
			</h2>
			<p class="mt-4 max-w-[418px] font-poppins text-2xl font-normal text-white">
				Join Thousands Using Bias Doctor...
			</p>
			<div class="mt-6">
				<PrimaryButton label="Get Started Free" href="/login" variant="white" />
			</div>
		</div>
	</div>
</div>

<div class="border-t border-white/10 bg-black py-6">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-8 text-xs text-white/80">
		<p><span class="font-semibold">BiasDoc</span> – Bias &amp; Misinformation Doc</p>
	</div>
</div>
