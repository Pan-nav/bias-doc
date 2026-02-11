<script lang="ts">

	import { fly } from 'svelte/transition';

	type FeatureCardProps = {
		title: string;
	};

	let { title }: FeatureCardProps = $props();
</script>

<div
	class="flex h-[60px] w-[210px] items-center justify-center rounded-[15px] bg-[#070707] font-inter text-[15px] font-bold text-white"
	in:fly={{ y: 16, duration: 350 }}
>
	{title}
</div>
