<script>
	import { ROUTES } from '$lib/routes.util';
	import LogOut from '~icons/lucide/log-out';
	import { capture, reset } from '$lib/posthog';
	import { navRowClass, navIconStyle } from '$lib/components/nav-row';

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
	<!-- Native submit styled as a nav row: matches the theme toggle and links above.
	TYPE MATTERS: the shadcn Button defaulted to type="button", so without JS the
	click submitted nothing despite the comment claiming otherwise. type="submit"
	keeps the no-JS POST working; with JS, resetPostHog holds it for analytics. -->
	<button type="submit" class={navRowClass} disabled={busy} onclick={resetPostHog}>
		<!-- Lucide like the rest of the sidebar, same shared icon weight. -->
		<LogOut style={navIconStyle()} />
		<span>sign out</span>
	</button>
</form>
