<script lang="ts">
	/**
	 * StatCard – displays a single statistic (e.g. "73%", "Misinfo") in the Problem section.
	 * Validation: label and value are required and no empty strings are allowed by the parent data.
	 * Uses svelte/transition fade for a simple entrance animation on scroll into view.
	 */

	import { fade } from 'svelte/transition';

	type StatCardProps = {
		label: string;
		value: string;
	};

	let { label, value }: StatCardProps = $props();
</script>

<div
	class="flex h-[118px] w-[179px] flex-col items-center justify-center rounded-[15px] border border-[#1898F4] bg-[#070707] text-center"
	in:fade={{ duration: 400 }}
>
	<p class="font-inter text-3xl font-bold text-white">{value}</p>
	<p class="mt-2 font-inter text-sm font-bold text-[#1898F4]">{label}</p>
</div>
