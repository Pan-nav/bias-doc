<script lang="ts">
	type ButtonVariant = 'gradient' | 'white';

	type PrimaryButtonProps = {
		label: string;
		variant?: ButtonVariant;
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		fullWidth?: boolean
	};

	let { label, variant = 'gradient', href, type = 'button', disabled = false, fullWidth = false }: PrimaryButtonProps = $props();

	const gradientStyle = 'background: linear-gradient(90deg, #1856F4 0%, #1898F4 21%, #6C5EAE 100%);';

	// Use $derived so class strings update when fullWidth changes.
	const gradientClasses = $derived(
		'flex h-[38px] items-center justify-center gap-2 rounded-[15px] px-5 py-2.5 font-inter text-sm font-bold leading-5 ' +
		'tracking-normal text-white shadow-lg transition hover:opacity-90 ' +
			(fullWidth ? 'w-full' : 'min-w-[208px]')
	);
	const whiteClasses = $derived(
		'flex h-8 items-center justify-center gap-2 rounded-[15px] bg-white px-5 py-2 font-inter text-sm font-bold leading-5 ' +
		'tracking-normal text-[#1898F4] transition hover:bg-gray-100 ' +
			(fullWidth ? 'w-full' : 'min-w-[178px]')
	);
</script>

<!-- Renders <a> when href provided (navigation), <button> otherwise (form submit).
Avoids wrapping buttons in links. -->
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
		class="{variant === 'white' ? whiteClasses : gradientClasses} {disabled ? 'cursor-not-allowed opacity-50' : ''}"
		style={variant === 'gradient' ? gradientStyle : ''}
		{type}
		{disabled}
	>
		{label}
	</button>
{/if}
