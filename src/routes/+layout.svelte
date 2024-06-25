<script>
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	export let data;
</script>

<PrimaryNav user={data?.user} />
<slot></slot>

<svelte:head>
	<title>remember forever</title>
	<meta name="description" content="a tool that helps you remember" />
</svelte:head>
