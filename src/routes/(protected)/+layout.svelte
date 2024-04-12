<script>
	import Logout from '$lib/components/Logout.svelte';
</script>

<slot />
<nav>
	<ul>
		<li>
			<Logout />
		</li>
	</ul>
</nav>
