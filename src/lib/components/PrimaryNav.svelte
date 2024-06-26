<script>
	import Logo from '$lib/assets/logo-black.png?enhanced';
	import Logout from '$lib/components/Logout.svelte';
	import BrainF from '~icons/arcticons/brainf';
	import JotTextEditor from '~icons/arcticons/jotatexteditor';
	import SoloLearn from '~icons/arcticons/sololearn';
	import GithubStar from '~icons/material-symbols-light/kid-star-outline';
	import SendIt from '~icons/arcticons/sendit';
	import MeditationAssistant from '~icons/arcticons/atom-meditation';
	import Hamburger from '~icons/arcticons/hamburger-menu';
	import { page } from '$app/stores';
	import Google from '$lib/components/Buttons/Google.svelte';
	import { ROUTES } from '$lib/routes.util';

	const signedInLinks = [
		{ href: '/record', text: 'record', icon: JotTextEditor },
		{ href: '/revise', text: 'revise', icon: SoloLearn },
		{ href: '/learn', text: 'generate with ai', icon: BrainF }
	];
	const signedOuLinks = [
		{ href: 'https://github.com/xerosanyam/remfo', text: 'star on github', icon: GithubStar },
		{
			href: 'https://github.com/xerosanyam/remfo/tree/main/essays',
			text: 'essays',
			icon: MeditationAssistant
		},
		{ href: 'https://twitter.com/xerosanyam', text: 'share feedback', icon: SendIt }
		// { href: 'https://x.com/remfoapp', text: 'follow on x', icon: XIcon }
	];

	export let user;
	let links;
	if (user) {
		links = signedInLinks;
	} else {
		links = signedOuLinks;
	}

	const pinMenu = $page.url.pathname !== ROUTES.LOGIN;
	const open = pinMenu || !$page.data.deviceType.isMobile;
</script>

<header
	class="fixed bottom-0 z-10 flex w-full flex-col border-r bg-white shadow-lg sm:top-0 sm:h-screen sm:w-44"
>
	<a class="hidden items-center p-2 text-gray-900 sm:flex md:mb-0" href="/">
		<enhanced:img
			src={Logo}
			class="h-10 w-10 rounded-full"
			title="logo of remember forever"
			alt="logo of remember forever"
		></enhanced:img>
	</a>
	<details {open}>
		<summary class={`list-none p-4 sm:hidden ${pinMenu ? 'hidden' : ''}`}>
			<div class="flex items-center justify-between">
				<Hamburger class="text-xl" />
				<span class="flex space-x-1">
					<!-- <Login /> -->
					<Google text="sign up / login" />
				</span>
			</div>
		</summary>
		<nav class="flex w-screen sm:mt-8 sm:w-44 sm:flex-col sm:space-y-2">
			{#each links as link (link.href)}
				<a
					target={link.href.includes('https://') ? '_blank' : ''}
					class={`${$page.url.pathname === link.href ? 'bg-gray-100' : ''} flex w-1/3 flex-col items-center whitespace-nowrap p-1 px-4 text-xs ring-offset-background transition-colors hover:bg-gray-200  hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:w-full sm:flex-row sm:gap-2 sm:py-6 sm:text-base `}
					href={link.href}
				>
					<svelte:component
						this={link.icon}
						style={`font-size:1.5rem;stroke-width:${$page.url.pathname === link.href ? '2px;' : '1.5px'}`}
					/>
					{link.text}
				</a>
			{/each}
		</nav>
	</details>
	<div class="hidden sm:block">
		{#if user}
			<Logout />
		{/if}
	</div>
</header>
