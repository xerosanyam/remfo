<script lang="ts">
	import CardReview from '$lib/components/Cards/CardReview.svelte';
	export let data;
</script>

<svelte:head>
	<title>Remfo | Revise</title>
</svelte:head>

<CardReview cards={data.cards} />
