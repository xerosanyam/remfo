<script>
	import Logo from '$lib/assets/logo-black.png?enhanced';
	import Logout from '$lib/components/Logout.svelte';
	import BrainF from '~icons/arcticons/brainf';
	import Pomodoro from '~icons/arcticons/pomodoro';
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
	import Sun from '~icons/lucide/sun';
	import Moon from '~icons/lucide/moon';
	import { onMount } from 'svelte';

	const signedInLinks = [
		{ href: '/record', text: 'record', icon: JotTextEditor },
		{ href: '/revise', text: 'revise', icon: SoloLearn },
		{ href: '/measure', text: 'measure', icon: BodyMeasures },
		{ href: '/learn', text: 'generate with ai', icon: BrainF },
		{ href: ROUTES.POMO, text: 'pomo', icon: Pomodoro }
	];
	const signedOuLinks = [
		{ href: ROUTES.POMO, text: 'pomo', icon: Pomodoro },
		{ href: 'https://github.com/xerosanyam/remfo', text: 'star on github', icon: GithubStar },
		{
			href: 'https://github.com/xerosanyam/remfo/tree/main/essays',
			text: 'essays',
			icon: MeditationAssistant
		},
		{ href: 'https://twitter.com/xerosanyam', text: 'share feedback', icon: SendIt },
		{ href: ROUTES.PRIVACY, text: 'privacy policy', icon: PrivacyTip }
		// { href: 'https://x.com/remfoapp', text: 'follow on x', icon: XIcon }
	];

	export let user;
	let isDark = false;

	onMount(() => {
		const system = window.matchMedia('(prefers-color-scheme: dark)');
		const syncTheme = () => {
			let choice = null;
			try {
				choice = localStorage.getItem('theme');
			} catch {
				// A blocked storage API still allows a theme for this visit.
			}
			isDark = choice === 'dark' || (choice !== 'light' && system.matches);
			document.documentElement.classList.toggle('dark', isDark);
			document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
		};
		syncTheme();
		system.addEventListener('change', syncTheme);
		window.addEventListener('storage', syncTheme);
		return () => {
			system.removeEventListener('change', syncTheme);
			window.removeEventListener('storage', syncTheme);
		};
	});

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
		try {
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		} catch {
			// Theme still changes for this visit when storage is unavailable.
		}
	}

	// Reactive on purpose. This nav lives in the root layout, so the component survives
	// client-side navigation: after signing in without a full page load, `user` changes but a
	// one-time assignment here would keep showing the signed-out links.
	$: links = user ? signedInLinks : signedOuLinks;

	$: pinMenu = $page.url.pathname !== ROUTES.LOGIN;
	$: open = !user || pinMenu || !$page.data.deviceType?.isMobile;
</script>

<header
	class="fixed bottom-0 z-20 flex w-full flex-col border-r border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950 sm:top-0 sm:h-screen sm:w-44"
>
	<a class="hidden items-center p-2 sm:flex md:mb-0" href="/" aria-label="remember forever home">
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
					{#if !user}
						<Google text="sign up / login" />
					{/if}
				</span>
			</div>
		</summary>
		<nav class="flex w-full sm:mt-8 sm:w-44 sm:flex-col">
			{#each links as link (link.href)}
				<a
					target={link.href.includes('https://') ? '_blank' : ''}
					class={`${$page.url.pathname === link.href ? 'bg-slate-100 dark:bg-violet-900' : ''} flex min-w-0 flex-1 flex-col items-center border-r border-slate-200 px-1 py-2 text-center text-xs leading-tight ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:border-slate-700 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300 sm:h-10 sm:w-full sm:flex-none sm:flex-row sm:gap-2 sm:border-r-0 sm:px-4 sm:py-6 sm:text-left sm:text-base`}
					href={link.href}
				>
					<svelte:component
						this={link.icon}
						style={`font-size:1.5rem;stroke-width:${$page.url.pathname === link.href ? '2px;' : '1.5px'}`}
					></svelte:component>
					{link.text}
				</a>
			{/each}
			<button
				type="button"
				on:click={toggleTheme}
				aria-label="dark mode"
				aria-pressed={isDark}
				class="flex min-w-0 flex-1 flex-col items-center border-r border-slate-200 px-1 py-2 text-center text-xs leading-tight ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:border-slate-700 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300 sm:h-10 sm:w-full sm:flex-none sm:flex-row sm:gap-2 sm:border-r-0 sm:px-4 sm:py-6 sm:text-left sm:text-base"
			>
				{#if isDark}<Sun style="font-size:1.5rem" />{:else}<Moon style="font-size:1.5rem" />{/if}
				<span>theme</span>
			</button>
		</nav>
	</details>
	<div class="hidden sm:block">
		{#if user}<Logout></Logout>
		{/if}
	</div>
</header>
