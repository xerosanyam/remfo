<script>
	import { ROUTES } from '$lib/routes.util';
	import ExitIcon from '~icons/mdi/exit-run';
</script>

<form class="w-1/5 sm:mt-auto sm:w-full" method="post" action={ROUTES.LOGOUT}>
	<button
		class="flex h-16 w-full flex-col items-center justify-center gap-0.5 border-r p-1 text-center text-[0.7rem] leading-tight text-gray-900 ring-offset-background transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:flex-row sm:justify-start sm:gap-2 sm:border-r-0 sm:px-4 sm:py-6 sm:text-left sm:text-base sm:leading-normal"
		type="submit"
	>
		<ExitIcon />
		sign out
	</button>
</form>
