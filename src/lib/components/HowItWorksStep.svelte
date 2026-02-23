<script lang="ts">
	/**
	 * HowItWorksStep – a node in the "How it works" diagram (numbered circle + label).
	 * Validation: stepNumber must be 1–3; label must be non-empty. Blue circle 
	 * matches the primary accent and the white number ensures readability.
	 */

	import { fly } from 'svelte/transition';

	type HowItWorksStepProps = {
		stepNumber: number;
		label: string;
	};

	let { stepNumber, label }: HowItWorksStepProps = $props();
</script>

<div class="flex flex-col items-center" in:fly={{ y: 10, duration: 300 }}>
	<div
		class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1898F4] font-inter text-base font-bold text-white"
	>
		{stepNumber}
	</div>
	<span class="mt-3 font-inter text-sm font-medium text-white">{label}</span>
</div>
