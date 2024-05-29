<script>
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	export let data;
</script>

<Header user={data?.user} />
<slot></slot>

<svelte:head>
	<title>Remember Forever</title>
	<meta name="description" content="A tool that helps you remember" />
</svelte:head>
