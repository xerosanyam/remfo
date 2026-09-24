<script>
	import { ROUTES } from '$lib/routes.util';
	import ExitIcon from '~icons/mdi/exit-run';
	import { capture, reset } from '$lib/posthog';

	/** @type {HTMLFormElement | undefined} */
	let form;

	/** @param {MouseEvent} event */
	async function resetPostHog(event) {
		// The analytics SDK loads lazily after paint; a plain submit would unload the
		// page before capture/reset run, losing the event and leaving the distinct_id
		// linked to the signed-out user. Hold the submit for the analytics calls, capped
		// so logout never hangs on them. No-JS unaffected: without JS there is no click
		// handler, the native POST just works.
		event.preventDefault();
		try {
			await Promise.race([
				(async () => {
					await capture('user_logged_out');
					await reset();
				})(),
				new Promise((resolve) => setTimeout(resolve, 1500))
			]);
		} finally {
			form?.requestSubmit();
		}
	}
</script>

<form method="post" action={ROUTES.LOGOUT} bind:this={form}>
	<button
		class="flex w-full items-center gap-2 px-4 py-4 whitespace-nowrap text-slate-500 ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-slate-300 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300"
		on:click={resetPostHog}
	>
		<ExitIcon />
		sign out
	</button>
</form>
