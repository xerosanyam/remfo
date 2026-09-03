# Shared layouts

## Root app shell

- Path: `src/routes/+layout.svelte`
- Provides the full-height page shell, desktop sidebar offset, mobile bottom navigation, analytics, and global metadata.

```svelte
<script>
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	import { onMount } from 'svelte';
	import { inject } from '@vercel/analytics';
	import { pwaInfo } from 'virtual:pwa-info';

	onMount(async () => {
		if (!['localhost', '127.0.0.1'].includes(location.hostname)) inject({ mode: 'production' });
		const { default: posthog } = await import('posthog-js');
		posthog.init('phc_9926SwyRC8yPRYf8le7laIwsnf1ygzhp3TtwXpYJ8Eq', {
			api_host: 'https://us.i.posthog.com',
			person_profiles: 'identified_only'
		});
	});
	export let data;
	const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<div class="flex min-h-screen flex-col sm:block">
	<main class="flex-1 sm:ml-44">
		<slot></slot>
	</main>
	<PrimaryNav user={data?.user} />
</div>

<svelte:head>
	<title>remember forever</title>
	<meta name="description" content="a tool that helps you remember" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	{@html webManifestLink}
</svelte:head>
```

## Protected layout

- Path: `src/routes/(protected)/+layout.svelte`
- Adds protected-page title metadata and otherwise passes content through.

```svelte
<svelte:head>
	<title>remember forever</title>
</svelte:head>

<slot></slot>
```

## PrimaryNav

- Path: `src/lib/components/PrimaryNav.svelte`
- Persistent desktop sidebar and mobile bottom navigation.

```svelte
<script>
	import Logo from '$lib/assets/logo-black.png?enhanced';
	import Logout from '$lib/components/Logout.svelte';
	import BrainF from '~icons/arcticons/brainf';
	import JotTextEditor from '~icons/arcticons/jotatexteditor';
	import SoloLearn from '~icons/arcticons/sololearn';
	import GithubStar from '~icons/material-symbols-light/kid-star-outline';
	import PrivacyTip from '~icons/material-symbols-light/privacy-tip-outline';
	import SendIt from '~icons/arcticons/sendit';
	import MeditationAssistant from '~icons/arcticons/atom-meditation';
	import Hamburger from '~icons/arcticons/hamburger-menu';
	import { page } from '$app/stores';
	import Google from '$lib/components/Buttons/Google.svelte';
	import { ROUTES } from '$lib/routes.util';
	import BodyMeasures from 'virtual:icons/arcticons/body-measures';

	const signedInLinks = [
		{ href: '/record', text: 'record', icon: JotTextEditor },
		{ href: '/revise', text: 'revise', icon: SoloLearn },
		{ href: '/measure', text: 'measure', icon: BodyMeasures },
		{ href: '/learn', text: 'generate with ai', icon: BrainF }
	];
	const signedOuLinks = [
		{ href: 'https://github.com/xerosanyam/remfo', text: 'star on github', icon: GithubStar },
		{ href: 'https://github.com/xerosanyam/remfo/tree/main/essays', text: 'essays', icon: MeditationAssistant },
		{ href: 'https://twitter.com/xerosanyam', text: 'share feedback', icon: SendIt },
		{ href: ROUTES.PRIVACY, text: 'privacy policy', icon: PrivacyTip }
	];

	export let user;
	$: links = user ? signedInLinks : signedOuLinks;
	$: pinMenu = $page.url.pathname !== ROUTES.LOGIN;
	$: open = !user || pinMenu || !$page.data.deviceType?.isMobile;
</script>

<div aria-hidden="true" class="shrink-0 sm:hidden" style={`height: calc(${open && !pinMenu ? '8rem' : '4rem'} + env(safe-area-inset-bottom))`}></div>

<header class="fixed bottom-0 z-20 flex w-full flex-col border-r bg-white pb-[env(safe-area-inset-bottom)] shadow-lg sm:top-0 sm:h-screen sm:w-44 sm:pb-0">
	<a class="hidden items-center p-2 text-gray-900 sm:flex md:mb-0" href="/" aria-label="remember forever home">
		<enhanced:img src={Logo} class="h-10 w-10 rounded-full" title="logo of remember forever" alt="logo of remember forever"></enhanced:img>
	</a>
	<details {open} class="sm:flex sm:min-h-0 sm:flex-1 sm:flex-col">
		<summary class={`h-16 list-none p-4 sm:hidden ${pinMenu ? 'hidden' : ''}`}>
			<div class="flex items-center justify-between">
				<Hamburger class="text-xl" />
				<span class="flex space-x-1">{#if !user}<Google text="sign up / login" />{/if}</span>
			</div>
		</summary>
		<nav class="flex w-screen sm:mt-8 sm:w-44 sm:flex-1 sm:flex-col">
			{#each links as link (link.href)}
				<a target={link.href.includes('https://') ? '_blank' : ''} class={`${$page.url.pathname === link.href ? 'bg-gray-100' : ''} flex h-16 min-w-0 ${user ? 'w-1/5' : 'w-1/4'} flex-col items-center justify-center border-r p-1 text-center text-[0.7rem] leading-tight ring-offset-background transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10 sm:w-full sm:flex-row sm:justify-start sm:gap-2 sm:px-4 sm:py-6 sm:text-left sm:text-base sm:leading-normal`} href={link.href}>
					<svelte:component this={link.icon} style={`font-size:1.5rem;stroke-width:${$page.url.pathname === link.href ? '2px;' : '1.5px'}`}></svelte:component>
					{link.text}
				</a>
			{/each}
			{#if user}<Logout />{/if}
		</nav>
	</details>
</header>
```
