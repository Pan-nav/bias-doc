<script lang="ts">
	/**
	 * Dashboard – shown after successful login.
	 * For Prototype 2 we only show a welcome message and logout; later we'll add analysis history etc.
	 * If the user is not in the store (e.g. they refreshed), we redirect back to login.
	 */

	import { goto } from '$app/navigation';
	import { currentUser, logout } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	let user = $state<{ email: string } | null>(null);

	onMount(() => {
		user = get(currentUser);
		if (user === null) {
			goto('/login');
			return;
		}
		const unsub = currentUser.subscribe((u) => { user = u; });
		return unsub;
	});

	function handleLogout() {
		logout();
		goto('/login');
	}
</script>

<div class="mx-auto max-w-2xl px-8 py-16 font-inter">
	<h1 class="text-2xl font-bold text-white">Dashboard</h1>
	{#if user}
		<p class="mt-2 text-gray-400">You are logged in as {user.email}</p>
		<button
			type="button"
			class="mt-6 rounded-[15px] border border-[#1898F4] px-6 py-2 text-sm font-bold text-white"
			onclick={handleLogout}
		>
			Log out
		</button>
	{/if}
</div>
