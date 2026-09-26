<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/routes.util';
	import { Button } from '$lib/components/ui/button';

	// Deliberately never renders page.error.message: for a 500 that string can carry
	// internal detail, and for a 404 it is only ever SvelteKit's own "Not Found".
	const notFound = $derived(page.status === 404);
	const home = $derived(page.data?.user ? ROUTES.HOME : ROUTES.LOGIN);
</script>

<svelte:head>
	<title>{notFound ? 'page not found' : 'something went wrong'}</title>
</svelte:head>

<section class="mx-auto mt-10 max-w-lg px-4 text-center">
	<p class="text-muted-foreground font-mono text-5xl">{page.status}</p>
	<h1 class="mt-4 text-2xl">
		{notFound ? 'that page does not exist' : 'something went wrong on our side'}
	</h1>
	<p class="text-muted-foreground mt-2">
		{notFound
			? 'the link may be old, or the page may have moved.'
			: 'the error has been logged. trying again often works.'}
	</p>
	<Button href={resolve(home)} class="mt-8">go home</Button>
</section>
