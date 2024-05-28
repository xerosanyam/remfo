<script>
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	export let data;
</script>

<Header user={data?.user} />
<slot></slot>
