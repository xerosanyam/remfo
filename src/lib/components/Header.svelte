<script>
	import Logout from '$lib/components/Logout.svelte';
</script>

<header class="body-font sticky top-0 z-10 border-b bg-white text-gray-600">
	<div class="container mx-auto flex flex-col flex-wrap items-center p-2 md:flex-row">
		<a class="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0" href="/">
			<img src="/logo-black.png" class="h-10 w-10 rounded-full" alt="logo" />
		</a>
		<nav class="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
			<a
				class="mr-5 flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				href="/"
			>
				<img src="/home.svg" alt="" />
				Home
			</a>
			<a
				class="mr-5 flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				href="/all"
			>
				<img src="/book.svg" alt="" />
				All Cards
			</a>
			<a
				class="mr-5 flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				href="/learn"
			>
				<img src="/book.svg" alt="" />
				Learn
			</a>
		</nav>
		<Logout />
	</div>
</header>
