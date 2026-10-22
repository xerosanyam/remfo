<script>
	import { onMount } from 'svelte';
	import Google from '$lib/components/Buttons/Google.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ROUTES } from '$lib/routes.util';
	import NotebookPen from '~icons/lucide/notebook-pen';
	import ChartLine from '~icons/lucide/chart-line';
	import Brain from '~icons/lucide/brain';
	import Repeat from '~icons/lucide/repeat';

	// Prerendered page, no server load: read the single-use oauth cookie client-side, and
	// swap the sign-in block for a "go to app" button when /api/me reports a session.
	let bouncedFromGoogle = false;
	let signedIn = false;
	onMount(async () => {
		bouncedFromGoogle = document.cookie
			.split('; ')
			.some((c) => c.startsWith('google_oauth_state='));
		try {
			signedIn = !!(await (await fetch('/api/me')).json()).user;
		} catch {
			// Offline / endpoint hiccup: stay on the sign-in block.
		}
	});
</script>

<div class="container mx-auto h-screen max-w-lg items-center py-8">
	<div class="mx-auto font-sans">
		<h1 class="mb-2 text-3xl font-medium">a tool that helps you remember.</h1>
		<ul class="landing-features mt-10 grid gap-8">
			<li class="flex items-start gap-4">
				<NotebookPen style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">record</h2>
					<p class="text-muted-foreground">record new words, learnings, affirmations, anything</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<Repeat style="font-size:2.2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">revise</h2>
					<p class="text-muted-foreground">app will intelligently schedule things for revision</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<ChartLine style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">measure</h2>
					<p class="text-muted-foreground">visualize your progress</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<Brain style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">powered by ai</h2>
					<p class="text-muted-foreground">... of course its powered by ai</p>
				</div>
			</li>
		</ul>
	</div>
	<div class="mt-10 hidden justify-center space-x-1 sm:flex">
		{#if signedIn}
			<Button href={ROUTES.HOME}>go to app</Button>
		{:else}
			<Google text="sign up / login" />
		{/if}
	</div>

	{#if !signedIn}
		<!-- The fallback stays a quiet link, never a second button: it must not compete with the
	     primary call to action for people whose browser google accepts. It sits outside the
	     wrapper above, which is hidden below the sm breakpoint, so it stays reachable at the
	     narrow widths where this is actually needed. -->
		<p class="text-muted-foreground mx-auto mt-6 max-w-xs text-center text-sm">
			{#if bouncedFromGoogle}
				couldn't sign in? some browsers can't load google's sign-in page.
				<a class="whitespace-nowrap underline" href={ROUTES.LOGIN_DEVICE}>sign in with a code</a>
			{:else}
				<a class="underline" href={ROUTES.LOGIN_DEVICE}>trouble signing in? use a code</a>
			{/if}
		</p>
	{/if}
</div>
