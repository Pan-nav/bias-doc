<script lang="ts">
	/**
	 * Login / Sign-up page (Prototype 2).
	 * User flow: enter email + password → if email not in storage, show "Create new account?" modal;
	 * if yes, create and redirect to dashboard. If email exists, check password → match = redirect,
	 * else show "Invalid password". Validation runs on input so the button stays disabled until valid.
	 */

	import { goto } from '$app/navigation';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import { createAccount, login, userExists } from '$lib/stores/auth';
	import { validateEmail, validatePassword } from '$lib/utils/validation';

	let userEmail = $state('');
	let userPassword = $state('');
	let isPasswordVisible = $state(false);
	let isSubmitting = $state(false);
	let passwordError = $state('');
	let showCreateConfirm = $state(false);

	// Reactive validation so we can disable the button and show errors inli
	let emailValidation = $derived(validateEmail(userEmail));
	let passwordValidation = $derived(validatePassword(userPassword));
	let isFormValid = $derived((emailValidation.valid || passwordValidation.valid) && !isSubmitting);

	function handleSubmit() {
		if (!isFormValid) return;
		passwordError = '';
		const email = userEmail.trim().toLowerCase();

		if (userExists(email)) {
			// Existing user: check password
			const result = login(userEmail.trim(), userPassword);
			if (result.success) {
				isSubmitting = true;
				goto('/dashboard');
			} else {
				passwordError = result.error ?? 'Invalid password';
			}
			return;
		}

		// New user: show confirmation before creating account
		showCreateConfirm = true;
	}

	function confirmCreateAccount() {
		createAccount(userEmail.trim(), userPassword);
		showCreateConfirm = false;
		isSubmitting = true;
		goto('/dashboard');
	}

	function cancelCreateAccount() {
		showCreateConfirm = false;
	}
</script>

<!-- The background image, which will be default to all pages except the landing page -->
<div
	class="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-4 py-12 font-inter"
	style="background:
    radial-gradient(ellipse at bottom left, #00F3F9, #0034EB 30%, transparent 55%),
    #000;"
>
	<div
		class="w-full max-w-[450px] rounded-[15px] px-8 py-10 shadow-xl"
		style="background-color: #000000;"
	>
		<h1 class="text-2xl font-bold text-white">Login</h1>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="mt-6 flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="login-email" class="text-sm font-medium text-white">Email</label>
				<input
					id="login-email"
					type="email"
					bind:value={userEmail}
					placeholder="example@gmail.com"
					autocomplete="email"
					class="w-full rounded-[8px] border px-4 py-3 text-white placeholder-gray-500 focus:border-[#1898F4] focus:outline-none focus:ring-1 focus:ring-[#1898F4] {emailValidation.valid || !userEmail ? 'border-gray-700' : 'border-red-500'}"
					style="background-color: #0F0F0F;"
				/>
				{#if !emailValidation.valid && userEmail}
					<p class="text-xs text-[#EF4444]" style="font-size: 12px;">{emailValidation.error}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="login-password" class="text-sm font-medium text-white">Password</label>
				<div class="relative">
					<input
						id="login-password"
						type="password"
						bind:value={userPassword}
						placeholder="Enter password"
						autocomplete="current-password"
						class="w-full rounded-[8px] border py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:border-[#1898F4] focus:outline-none focus:ring-1 focus:ring-[#1898F4] {passwordValidation.valid || !userPassword ? 'border-gray-700' : 'border-red-500'}"
						style="background-color: #0F0F0F;"
					/>
					<button
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
						aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
						disabled
					>
						{#if isPasswordVisible}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
				</div>
				{#if passwordValidation.errors.length > 0}
					<ul class="list-inside list-disc text-[#EF4444]" style="font-size: 12px;">
						{#each passwordValidation.errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				{/if}
				{#if passwordError}
					<p class="text-xs text-[#EF4444]" style="font-size: 12px;">{passwordError}</p>
				{/if}
			</div>

			<div class="mt-2">
				<PrimaryButton
					type="submit"
					label={isSubmitting ? 'Loading...' : 'Login/Sign up'}
					disabled={!isFormValid}
					fullWidth
				/>
			</div>
		</form>

		<p class="mt-4 text-center text-xs text-gray-500">
			Account will be created if it doesn't already exist.
		</p>
	</div>
</div>

<!-- Modal: "Account doesn't exist. Create new account?" -->
{#if showCreateConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-inter"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div
			class="mx-4 w-full max-w-sm rounded-[15px] px-6 py-6 shadow-xl"
			style="background-color: #000000; border: 1px solid #333;"
		>
			<h2 id="confirm-title" class="text-lg font-bold text-white">Account doesn't exist</h2>
			<p class="mt-2 text-sm text-gray-400">Create new account?</p>
			<div class="mt-6 flex gap-3">
				<button
					type="button"
					class="flex-1 rounded-[15px] border border-[#1898F4] py-2 text-sm font-bold text-white"
					onclick={cancelCreateAccount}
				>
					No
				</button>
				<button
					type="button"
					class="flex-1 rounded-[15px] py-2 text-sm font-bold text-white"
					style="background: linear-gradient(90deg, #1856F4 0%, #1898F4 21%, #6C5EAE 100%);"
					onclick={confirmCreateAccount}
				>
					Yes
				</button>
			</div>
		</div>
	</div>
{/if}
