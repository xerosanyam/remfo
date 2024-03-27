<script>
	import Logout from '$lib/components/Logout.svelte';
	import { ROUTES } from '$lib/routes.util';
	export let data;
</script>

<h1>Remfo</h1>

{#if data.user}
	<a href={ROUTES.HOME}>Go to app</a>
	<Logout />
{:else}
	<a href={ROUTES.LOGIN}>Sign in</a>
{/if}
