<script>
	import { ROUTES } from '$lib/routes.util';
</script>

<form method="post" action={ROUTES.LOGOUT}>
	<button
		class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
	>
		<img src="/log-out.svg" alt="" />
		Sign out
	</button>
</form>
