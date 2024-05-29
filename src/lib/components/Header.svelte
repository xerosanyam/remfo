<script>
	import Login from '$lib/components/Buttons/Login.svelte';
	import Logout from '$lib/components/Logout.svelte';
	const signedInLinks = [
		{ href: '/', text: 'Home', icon: '/home.svg' },
		{ href: '/all', text: 'All Cards', icon: '/book.svg' },
		{ href: '/learn', text: 'Learn', icon: '/book-open.svg' }
	];
	export let user;
</script>

<header class="body-font sticky top-0 z-10 border-b bg-white text-gray-600">
	<div class="container mx-auto flex flex-col flex-wrap items-center p-2 md:flex-row">
		<a class="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0" href="/">
			<img src="/logo-black.png" class="h-10 w-10 rounded-full" alt="logo" />
		</a>
		<nav class="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
			{#if user}
				{#each signedInLinks as link (link.href)}
					<a
						class="mr-5 flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						href={link.href}
					>
						<img src={link.icon} alt="" />
						{link.text}
					</a>
				{/each}
			{/if}
		</nav>
		{#if user}
			<div title={`Logout of ${user.email}`}>
				<Logout />
			</div>
		{:else}
			<Login />
		{/if}
	</div>
</header>
