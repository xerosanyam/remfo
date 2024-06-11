<script>
	import Logo from '$lib/assets/logo-black.png?enhanced';
	import Login from '$lib/components/Buttons/Login.svelte';
	import Logout from '$lib/components/Logout.svelte';
	import BrainF from '~icons/arcticons/brainf';
	import JotTextEditor from '~icons/arcticons/jotatexteditor';
	import SoloLearn from '~icons/arcticons/sololearn';
	import GithubStar from '~icons/material-symbols-light/kid-star-outline';
	import SendIt from '~icons/arcticons/sendit';
	import MeditationAssistant from '~icons/arcticons/atom-meditation';
	import { page } from '$app/stores';

	const signedInLinks = [
		{ href: '/record', text: 'Record', icon: JotTextEditor },
		{ href: '/revise', text: 'Revise', icon: SoloLearn },
		{ href: '/learn', text: 'Play with AI', icon: BrainF }
	];
	const signedOuLinks = [
		{ href: 'https://github.com/xerosanyam/remfo', text: 'Star on Github', icon: GithubStar },
		{
			href: 'https://github.com/xerosanyam/remfo/tree/main/essays',
			text: 'Essays',
			icon: MeditationAssistant
		},
		{ href: 'https://twitter.com/xerosanyam', text: 'Share Feedback', icon: SendIt }
	];

	export let user;
</script>

<header class="fixed top-0 flex h-screen w-44 flex-col border-r">
	<a class="flex items-center p-2 text-gray-900 md:mb-0" href="/">
		<enhanced:img src={Logo} class="h-10 w-10 rounded-full" alt="logo"></enhanced:img>
	</a>
	<nav class="mt-8 flex-1 space-y-2">
		{#if user}
			{#each signedInLinks as link (link.href)}
				<a
					class={`${$page.url.pathname === link.href ? 'bg-gray-100' : ''} flex h-10 items-center gap-2  whitespace-nowrap  px-4 py-6 text-sm ring-offset-background transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
					href={link.href}
				>
					<svelte:component
						this={link.icon}
						style={`font-size:1.5rem;stroke-width:${$page.url.pathname === link.href ? '2px;' : '1.5px'}`}
					/>
					{link.text}
				</a>
			{/each}
		{:else}
			{#each signedOuLinks as link (link.href)}
				<a
					target="_blank"
					class={`${$page.url.pathname === link.href ? 'bg-gray-100' : ''} flex h-10 items-center gap-2  whitespace-nowrap  px-4 py-6 text-sm text-gray-500 ring-offset-background transition-colors hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
					href={link.href}
				>
					<svelte:component
						this={link.icon}
						style={`font-size:1.5rem;stroke-width:${$page.url.pathname === link.href ? '2px;' : '1.5px'}`}
					/>
					{link.text}
				</a>
			{/each}
		{/if}
	</nav>
	{#if user}
		<Logout />
	{:else}
		<Login />
	{/if}
</header>
