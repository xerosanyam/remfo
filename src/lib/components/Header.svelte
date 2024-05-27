<script>
	import Logout from '$lib/components/Logout.svelte';
</script>

<header class="body-font sticky top-0 z-10 border-b bg-white text-gray-600">
	<div class="container mx-auto flex flex-col flex-wrap items-center p-2 md:flex-row">
		<a class="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0" href="/">
			<img src="/logo.png" class="h-10 w-10 rounded-full" alt="logo" />
		</a>
		<nav class="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
			<a class="mr-5 hover:text-gray-900" href="/">Home</a>
			<a class="mr-5 hover:text-gray-900" href="/all">All Cards</a>
		</nav>
		<Logout />
	</div>
</header>
