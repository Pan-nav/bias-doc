<script lang="ts">
	type ButtonVariant = 'gradient' | 'white';

	type PrimaryButtonProps = {
		label: string;
		variant?: ButtonVariant;
		href?: string;
		type?: 'button' | 'submit';
	};

	let { label, variant = 'gradient', href, type = 'button' }: PrimaryButtonProps = $props();

	// Standard CTA: 208x38, padding 20, corner radius 15, gradient, drop shadow, Inter bold 14, white text.
	const gradientClasses ='flex h-[38px] min-w-[208px] items-center justify-center gap-2 rounded-[15px] px-5 py-2.5 font-inter text-sm font-bold leading-5 tracking-normal text-white shadow-lg transition hover:opacity-90';
	const gradientStyle = 'background: linear-gradient(90deg, #1856F4 0%, #1898F4 21%, #6C5EAE 100%);';

	// Final CTA variant: white fill, blue text. 178x32, padding 20, gap 8, corner radius 15.
	const whiteClasses = 'flex h-8 min-w-[178px] items-center justify-center gap-2 rounded-[15px] bg-white px-5 py-2 font-inter text-sm font-bold leading-5 tracking-normal text-[#1898F4] transition hover:bg-gray-100';
</script>

{#if href}
	<a
		{href}
		class={variant === 'white' ? whiteClasses : gradientClasses}
		style={variant === 'gradient' ? gradientStyle : ''}
	>
		{label}
	</a>
{:else}
	<button
		class={variant === 'white' ? whiteClasses : gradientClasses}
		style={variant === 'gradient' ? gradientStyle : ''}
		{type}
	>
		{label}
	</button>
{/if}
