<script lang="ts">
	import CardReview from '$lib/components/Cards/CardReview.svelte';
	export let data;
</script>

{#await data.cards then cards}
	<CardReview {cards} />
{/await}
