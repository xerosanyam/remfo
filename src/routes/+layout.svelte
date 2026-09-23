<script>
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	import { onMount } from 'svelte';
	import { identify } from '$lib/posthog';

	export let data;

	onMount(() => {
		const user = data?.user;
		if (!user?.id) return;

		// Deferred past load so the SDK fetch never contends with LCP (remfo-zfo).
		const run = () =>
			void identify(user.id, {
				email: user.email,
				name: user.name
			});
		if ('requestIdleCallback' in window) {
			window.requestIdleCallback(run, { timeout: 5000 });
		} else {
			setTimeout(run, 3000);
		}
	});
</script>

<PrimaryNav user={data?.user} />
<main class="sm:ml-44">
	<slot></slot>
</main>

<svelte:head>
	<title>remember forever</title>
	<meta name="description" content="a tool that helps you remember" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>
