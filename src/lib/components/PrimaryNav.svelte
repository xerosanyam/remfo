<script>
	import Logo from '$lib/assets/logo-black.png?enhanced';
	import Logout from '$lib/components/Logout.svelte';
	// Sidebar icons are lucide throughout (single library, single 24-unit grid),
	// so one shared stroke rule in app.css keeps every icon at the same weight.
	import NotebookPen from '~icons/lucide/notebook-pen';
	import Repeat from '~icons/lucide/repeat';
	import ChartLine from '~icons/lucide/chart-line';
	import Brain from '~icons/lucide/brain';
	import Timer from '~icons/lucide/timer';
	import Star from '~icons/lucide/star';
	import ScrollText from '~icons/lucide/scroll-text';
	import Send from '~icons/lucide/send';
	import ShieldCheck from '~icons/lucide/shield-check';
	import Menu from '~icons/lucide/menu';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';
	import { navRowClass, navIconStyle } from '$lib/components/nav-row';
	import Google from '$lib/components/Buttons/Google.svelte';
	import { ROUTES } from '$lib/routes.util';
	import Sun from '~icons/lucide/sun';
	import Moon from '~icons/lucide/moon';
	import { onMount } from 'svelte';

	const signedInLinks = [
		{ href: '/record', text: 'record', icon: NotebookPen },
		{ href: '/revise', text: 'revise', icon: Repeat },
		{ href: '/measure', text: 'measure', icon: ChartLine },
		{ href: '/learn', text: 'generate with ai', icon: Brain },
		{ href: ROUTES.POMO, text: 'pomo', icon: Timer }
	];
	const signedOuLinks = [
		{ href: ROUTES.POMO, text: 'pomo', icon: Timer },
		{ href: 'https://github.com/xerosanyam/remfo', text: 'star on github', icon: Star },
		{
			href: 'https://github.com/xerosanyam/remfo/tree/main/essays',
			text: 'essays',
			icon: ScrollText
		},
		{ href: 'https://twitter.com/xerosanyam', text: 'share feedback', icon: Send },
		{ href: ROUTES.PRIVACY, text: 'privacy policy', icon: ShieldCheck }
		// { href: 'https://x.com/remfoapp', text: 'follow on x', icon: XIcon }
	];

	let { user } = $props();
	let isDark = $state(false);

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
	// `/` doubles as the public landing page (ROUTES.LOGIN): it always wears the
	// public link set, even for signed-in users (the page body gives them "go to app").
	// Session controls below (sign-up button, sign out) still follow `user`.
	const onLanding = $derived(page.url.pathname === ROUTES.LOGIN);
	const links = $derived(user && !onLanding ? signedInLinks : signedOuLinks);

	// resolve() throws on external URLs, so only internal pathnames go through it.
	/** @param {any} to */
	const href = (to) => (to.startsWith('/') ? resolve(to) : to);

	const pinMenu = $derived(page.url.pathname !== ROUTES.LOGIN);
	const open = $derived(!user || pinMenu || !page.data.deviceType?.isMobile);
</script>

<header
	class="primary-nav border-border bg-background fixed bottom-0 z-20 flex w-full flex-col border-r shadow-lg sm:top-0 sm:h-screen sm:w-44"
>
	<a
		class="hidden items-center p-2 sm:flex md:mb-0"
		href={resolve('/')}
		aria-label="remember forever home"
	>
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
				<Menu style={navIconStyle()} />
				<span class="flex space-x-1">
					{#if !user}
						<Google text="sign up / login" />
					{/if}
				</span>
			</div>
		</summary>
		<nav class="flex w-full sm:mt-8 sm:w-44 sm:flex-col">
			{#each links as link (link.href)}
				{@const Icon = link.icon}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- internal URLs go through resolve() inside href(); resolve() throws on the external ones -->
				<a
					target={link.href.includes('https://') ? '_blank' : ''}
					class={cn(
						navRowClass,
						page.url.pathname === link.href && 'bg-accent text-accent-foreground'
					)}
					href={href(link.href)}
				>
					<Icon style={navIconStyle()}></Icon>
					{link.text}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/each}
			<button
				type="button"
				onclick={toggleTheme}
				aria-label="dark mode"
				aria-pressed={isDark}
				class={navRowClass}
			>
				{#if isDark}<Sun style={navIconStyle()} />{:else}<Moon style={navIconStyle()} />{/if}
				<span>theme</span>
			</button>
		</nav>
	</details>
	<div class="hidden sm:block">
		{#if user}<Logout></Logout>
		{/if}
	</div>
</header>
