<script>
	import { ROUTES } from '$lib/routes.util';
	import ExitIcon from '~icons/mdi/exit-run';
	import { capture, reset } from '$lib/posthog';
	import { Button } from '$lib/components/ui/button';

	/** @type {HTMLFormElement | undefined} */
	let form;
	let busy = false;

	/** @param {MouseEvent} event */
	async function resetPostHog(event) {
		// The analytics SDK loads lazily after paint; a plain submit would unload the
		// page before capture/reset run, losing the event and leaving the distinct_id
		// linked to the signed-out user. Hold the submit for the analytics calls, capped
		// so logout never hangs on them. No-JS unaffected: without JS there is no click
		// handler, the native POST just works.
		event.preventDefault();
		// Immediate feedback: the analytics hold below can keep the button dead for up
		// to 1.5s on slow networks, which reads as broken.
		busy = true;
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
	<Button
		type="submit"
		variant="ghost"
		class="w-full justify-start gap-2"
		disabled={busy}
		onclick={resetPostHog}
	>
		<ExitIcon data-icon="inline-start" />
		sign out
	</Button>
</form>
