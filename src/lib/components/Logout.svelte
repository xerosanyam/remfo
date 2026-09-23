<script>
	import { ROUTES } from '$lib/routes.util';
	import ExitIcon from '~icons/mdi/exit-run';
	import { capture, reset } from '$lib/posthog';

	async function resetPostHog() {
		await capture('user_logged_out');
		await reset();
	}
</script>

<form method="post" action={ROUTES.LOGOUT}>
	<button
		class="flex w-full items-center gap-2 whitespace-nowrap px-4 py-4 text-slate-500 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-300 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300"
		on:click={resetPostHog}
	>
		<ExitIcon />
		sign out
	</button>
</form>
