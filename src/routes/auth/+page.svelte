<script lang="ts">
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';

	/** Current mode: login shows "Welcome Back", signup shows "Create Account". */
	let authMode: 'login' | 'signup' = $state('login');

	/** Bound to the email input. Used for validation and future API submission. */
	let userEmail = $state('');

	/** Bound to the password input. Used for validation and future API submission. */
	let userPassword = $state('');

	/** Toggle password visibility (eye icon). Improves UX so users can check for typos. */
	let isPasswordVisible = $state(false);

	/** True while we're "submitting" – disables button and shows loading. TODO: replace with real API call. */
	let isSubmitting = $state(false);

	/** Error message */
	let submitError = $state('');

	/**
	 * Validates the email field.
	 * Returns an object with valid (boolean) and errors (array of messages to show).
	 */
	function validateEmail(email: string): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		const trimmed = email.trim();

		if (trimmed.length === 0) {
			errors.push('Please enter a valid email address');
			return { valid: false, errors };
		}
		if (!trimmed.includes('@')) {
			errors.push('Please enter a valid email address');
			return { valid: false, errors };
		}
		// Check for domain: something after @ and at least one dot (eg .com, .co.uk)
		const afterAt = trimmed.split('@')[1] ?? '';
		if (!afterAt || !afterAt.includes('.')) {
			errors.push('Please enter a valid email address');
			return { valid: false, errors };
		}
		return { valid: true, errors: [] };
	}

	/**
	 * Validates the password field against security rules.
	 * Returns an object with valid (boolean) and errors (array of messages for each failed rule).
	 */
	function validatePassword(password: string): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push('Password must be at least 8 characters');
		}
		if (!/[A-Z]/.test(password)) {
			errors.push('Password must contain at least one uppercase letter');
		}
		if (!/[0-9]/.test(password)) {
			errors.push('Password must contain at least one number');
		}

		return { valid: errors.length === 0, errors };
	}

	// Reactive validation: re-run when userEmail or userPassword change so we can disable submit and show errors.
	let emailValidation = $derived(validateEmail(userEmail));
	let passwordValidation = $derived(validatePassword(userPassword));

	let isEmailValid = $derived(emailValidation.valid);
	let isPasswordValid = $derived(passwordValidation.valid);
	let emailErrors = $derived(emailValidation.errors);
	let passwordErrors = $derived(passwordValidation.errors);

	/** Form can only be submitted when both fields pass validation and we're not already submitting. */
	let isFormValid = $derived(isEmailValid && isPasswordValid && !isSubmitting);

	function handleSubmit() {
		if (!isFormValid) return;
		submitError = '';
		isSubmitting = true;

		// TODO : Replace with real API call to backend (e.g. Firebase/Supabase).
		// TODO : Handle API errors and set submitError from response.
		setTimeout(() => {
			isSubmitting = false;
			// For now we just stop loading; in v3 we would redirect on success.
		}, 800);
	}

	function toggleMode() {
		authMode = authMode === 'login' ? 'signup' : 'login';
		submitError = '';
	}
</script>

<!-- Background uses main-gradient from config (cyan at top to black at bottom). -->
<div
	class="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-4 py-12"
	style="background: linear-gradient(180deg, #00F3F9 0%, #000000 100%);"
	role="main"
>
	<div
		class="w-full max-w-[450px] rounded-[12px] px-8 py-10 font-inter shadow-xl"
		style="background-color: #000000;"
	>
		<h1 class="text-2xl font-bold text-white">
			{authMode === 'login' ? 'Welcome Back' : 'Create Account'}
		</h1>
		<p class="mt-1 text-sm text-gray-400">Enter your details to continue</p>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="mt-6 flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="auth-email" class="text-sm font-medium text-white">Email Address</label>
				<input
					id="auth-email"
					type="email"
					bind:value={userEmail}
					placeholder="example@gmail.com"
					autocomplete="email"
					class="rounded-button w-full border border-gray-700 bg-[#0F0F0F] px-4 py-3 text-white placeholder-gray-500 focus:border-[#1898F4] focus:outline-none focus:ring-1 focus:ring-[#1898F4] {emailErrors.length ? 'border-red-500' : ''}"
					style="background-color: #0F0F0F;"
				/>
				{#if emailErrors.length > 0}
					<p class="text-xs text-[#EF4444]" style="font-size: 12px;">{emailErrors[0]}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="auth-password" class="text-sm font-medium text-white">Password</label>
				<div class="relative">
					<input
						id="auth-password"
						type={isPasswordVisible ? 'text' : 'password'}
						bind:value={userPassword}
						placeholder="Enter password"
						autocomplete={authMode === 'login' ? 'current-password' : 'new-password'}
						class="rounded-button w-full border border-gray-700 bg-[#0F0F0F] py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:border-[#1898F4] focus:outline-none focus:ring-1 focus:ring-[#1898F4] {passwordErrors.length ? 'border-red-500' : ''}"
						style="background-color: #0F0F0F;"
					/>
					<button
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
						aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
						onclick={() => (isPasswordVisible = !isPasswordVisible)}
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
				{#if passwordErrors.length > 0}
					<ul class="list-inside list-disc text-xs text-[#EF4444]" style="font-size: 12px;">
						{#each passwordErrors as err}
							<li>{err}</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if submitError}
				<p class="text-xs text-[#EF4444]" style="font-size: 12px;">{submitError}</p>
			{/if}

			<div class="mt-2">
				<PrimaryButton
					type="submit"
					label={isSubmitting ? 'Loading...' : 'Continue'}
					disabled={!isFormValid}
				/>
			</div>
		</form>

		<p class="mt-4 text-center text-xs text-gray-500">
			Account will be created automatically if it doesn't exist.
		</p>

		<p class="mt-6 text-center text-sm text-gray-400">
			{authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
			<button
				type="button"
				class="ml-1 font-medium text-[#1898F4] hover:underline"
				onclick={toggleMode}
			>
				{authMode === 'login' ? 'Sign up' : 'Log in'}
			</button>
		</p>
	</div>
</div>
