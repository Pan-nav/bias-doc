<script lang="ts">
	import './layout.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="fixed left-0 right-0 top-0 z-50 border-b border-primary/20 bg-black/80 backdrop-blur">
	<nav class="mx-auto flex max-w-[1920px] items-center justify-between px-8 py-4">
		<a href="/" class="font-inter text-base font-bold leading-8 tracking-normal text-white">
			Bias &amp; Misinformation Doc
		</a>

		<div class="flex items-center gap-2">
			<a
				href="/login"
				class="flex h-8 w-[97px] items-center justify-center rounded-[15px] border border-[#1898F4] bg-neutral-600 px-5 py-2 font-inter text-sm font-bold leading-5 tracking-normal text-white"
			>
				Login
			</a>
			<a
				href="/login"
				class="flex h-8 w-[101px] items-center justify-center rounded-[15px] border border-[#1898F4] bg-[#1898F4] px-5 py-2 font-inter text-sm font-bold leading-5 tracking-normal text-white"
			>
				Sign Up
			</a>
		</div>
	</nav>
</div>

<div class="pt-[72px]">
	{@render children()}
</div>
