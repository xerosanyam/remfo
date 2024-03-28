<script>
	import Logout from '$lib/components/Logout.svelte';
	import { ROUTES } from '$lib/routes.util';
</script>

<nav>
	<a href={ROUTES.HOME}>Home</a>
	<Logout />
</nav>
<slot />
