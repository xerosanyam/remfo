<script>
	import Logout from '$lib/components/Logout.svelte';
</script>

<slot />
<hr />
<nav>
	<ol>
		<li>
			<Logout />
		</li>
	</ol>
</nav>
