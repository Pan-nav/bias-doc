<script lang="ts">
	import { redirect } from '@sveltejs/kit';

	// Redirect old /login links to the main auth page so one place handles both login and signup.
	export function load() {
		throw redirect(302, '/auth');
	}
</script>
