<script lang="ts">
	/**
	 * FeatureCard – single feature label in the "Powerful features" grid.
	 * Minimal design: dark background, white text and 15px radius.
	 * Validation: title is required. Chose fly transition for a light upward motion on load.
	 */

	import { fly } from 'svelte/transition';

	type FeatureCardProps = {
		title: string;
	};

	let { title }: FeatureCardProps = $props();
</script>

<div
	class="flex h-[60px] w-[210px] items-center justify-center rounded-[15px] bg-[#131313] font-inter text-[15px] font-bold text-white"
	in:fly={{ y: 16, duration: 350 }}
>
	{title}
</div>
