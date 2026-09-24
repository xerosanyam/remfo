<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ROUTES } from '$lib/routes.util';

	// Deliberately never renders page.error.message: for a 500 that string can carry
	// internal detail, and for a 404 it is only ever SvelteKit's own "Not Found".
	const notFound = $derived(page.status === 404);
	const home = $derived(page.data?.user ? ROUTES.HOME : ROUTES.LOGIN);
</script>

<svelte:head>
	<title>{notFound ? 'page not found' : 'something went wrong'}</title>
</svelte:head>

<section class="mx-auto mt-10 max-w-lg px-4 text-center">
	<p class="font-mono text-5xl text-slate-500 dark:text-slate-300">{page.status}</p>
	<h1 class="mt-4 text-2xl">
		{notFound ? 'that page does not exist' : 'something went wrong on our side'}
	</h1>
	<p class="mt-2 text-slate-500 dark:text-slate-300">
		{notFound
			? 'the link may be old, or the page may have moved.'
			: 'the error has been logged. trying again often works.'}
	</p>
	<a
		href={resolve(home)}
		class="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-6 text-white ring-offset-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:bg-teal-300 dark:text-slate-950 dark:ring-offset-slate-950 dark:hover:bg-teal-200 dark:focus-visible:ring-teal-300"
	>
		go home
	</a>
</section>
