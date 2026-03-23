<script lang="ts">
	// Login / sign-up: valid email + password → existing user logs in, new user gets "create account?" modal.
	import { goto } from '$app/navigation';
	import { Eye, EyeOff } from 'lucide-svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import { createAccount, login, userExists } from '$lib/stores/auth';
	import { validateEmail, validatePassword } from '$lib/utils/validation';

	let userEmail = $state('');
	let userPassword = $state('');
	let showPassword = $state(false);
	let isSubmitting = $state(false);
	let passwordError = $state('');
	let showCreateConfirm = $state(false);

	// Error message strings — set by $effect so they update on every keystroke
	let emailError = $state('');
	let passwordErrors: string[] = $state([]);

	let emailValidation = $derived(validateEmail(userEmail));
	let passwordValidation = $derived(validatePassword(userPassword));
	let canSubmit = $derived((emailValidation.valid && passwordValidation.valid) && !isSubmitting);

	// Track when the user has left a field so errors only show on blur.
	let emailTouched = $state(false);
	let passwordTouched = $state(false);

	// Recompute email error whenever userEmail changes
	$effect(() => {
		if (emailTouched && userEmail.trim() !== '' && !emailValidation.valid) {
			emailError = emailValidation.error;
		} else {
			emailError = '';
		}
	});

	// Recompute password errors whenever userPassword changes
	$effect(() => {
		if (passwordTouched && userPassword.trim() !== '' && passwordValidation.errors.length > 0) {
			passwordErrors = [...passwordValidation.errors];
		} else {
			passwordErrors = [];
		}
	});

	// Clear API password error when email changes
	$effect(() => {
		userEmail;
		passwordError = '';
	});

	async function handleSubmit() {
		if (!canSubmit) return;
		const email = userEmail.trim().toLowerCase();

		if (await userExists(email)) {
			const result = await login(email, userPassword);
			if (result.success) {
				isSubmitting = true;
				goto('/dashboard');
			} else {
				passwordError = result.error ?? 'Wrong password';
			}
			return;
		}
		showCreateConfirm = true;
	}

	async function confirmCreateAccount() {
		const result = await createAccount(userEmail.trim(), userPassword);
		showCreateConfirm = false;
		if (!result.ok) {
			passwordError = result.error ?? 'Could not create account';
			return;
		}
		isSubmitting = true;
		goto('/dashboard');
	}
</script>

<div
	class="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-4 py-12 font-inter"
	style="background: radial-gradient(ellipse at bottom left, #00F3F9, #0034EB 30%, transparent 55%), #000;"
>
	<div class="w-full max-w-[450px] rounded-[15px] px-8 py-10 shadow-xl" style="background: #000;">
		<h1 class="text-2xl font-bold text-white">Login</h1>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				void handleSubmit();
			}}
			class="mt-6 flex flex-col gap-4"
		>
			<!-- Email -->
			<div class="flex flex-col gap-1">
				<label for="login-email" class="text-sm font-medium text-white">Email</label>
				<input
					id="login-email"
					type="text"
					bind:value={userEmail}
					onfocus={() => {
						emailTouched = false;
						emailError = '';
					}}
					onblur={() => (emailTouched = true)}
					placeholder="example@gmail.com"
					autocomplete="email"
					class="w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
					style="background: #0f0f0f; border-color: {emailError ? '#ef4444' : '#374151'};"
				/>
				<span
					style="color: #ef4444; font-size: 12px; display: {emailError ? 'block' : 'none'};"
				>{emailError}</span>
			</div>

			<!-- Password -->
			<div class="flex flex-col gap-1">
				<label for="login-password" class="text-sm font-medium text-white">Password</label>
				<div class="relative">
					<input
						id="login-password"
						type={showPassword ? 'text' : 'password'}
						bind:value={userPassword}
						onfocus={() => {
							passwordTouched = false;
							passwordErrors = [];
							passwordError = '';
						}}
						onblur={() => (passwordTouched = true)}
						placeholder="Enter password"
						autocomplete="current-password"
						class="w-full rounded-lg border py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none"
						style="background: #0f0f0f; border-color: {passwordErrors.length > 0 || passwordError ? '#ef4444' : '#374151'};"
					/>
					<button
						type="button"
						class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:text-white"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOff size={20} />
						{:else}
							<Eye size={20} />
						{/if}
					</button>
				</div>
				<div style="color: #ef4444; font-size: 12px; display: {passwordErrors.length > 0 || passwordError ? 'block' : 'none'};">
					{#each passwordErrors as err}
						<div style="margin-left: 8px;">• {err}</div>
					{/each}
					{#if passwordError}
						<div>{passwordError}</div>
					{/if}
				</div>
			</div>

			<div class="mt-2">
				<PrimaryButton
					type="submit"
					label={isSubmitting ? 'Loading...' : 'Login / Sign up'}
					disabled={!canSubmit}
					fullWidth
				/>
			</div>
		</form>

		<p class="mt-4 text-center text-xs text-gray-500">
			Account will be created if it doesn't already exist.
		</p>
	</div>
</div>

{#if showCreateConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-inter"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div
			class="mx-4 w-full max-w-sm rounded-[15px] border border-gray-700 px-6 py-6 shadow-xl"
			style="background: #000;"
		>
			<h2 id="confirm-title" class="text-lg font-bold text-white">Account doesn't exist</h2>
			<p class="mt-2 text-sm text-gray-400">Create new account?</p>
			<div class="mt-6 flex gap-3">
				<button
					type="button"
					class="flex-1 rounded-[15px] border border-[#1898F4] py-2 text-sm font-bold text-white"
					onclick={() => (showCreateConfirm = false)}
				>
					No
				</button>
				<button
					type="button"
					class="flex-1 rounded-[15px] bg-[#1898F4] py-2 text-sm font-bold text-white hover:bg-[#1478c4]"
					onclick={() => void confirmCreateAccount()}
				>
					Yes
				</button>
			</div>
		</div>
	</div>
{/if}
