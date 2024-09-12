<script>
	import { ROUTES } from '$project/utils/project.util';
	import ExitIcon from '~icons/mdi/exit-run';
</script>

<form method="post" action={ROUTES.LOGOUT}>
	<button
		class="flex w-full items-center gap-2 whitespace-nowrap px-4 py-4 text-gray-600 ring-offset-background transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
	>
		<ExitIcon />
		sign out
	</button>
</form>
