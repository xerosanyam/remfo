<script lang="ts">
	import ReviseCards from './ReviseCards.svelte';
	export let data;
</script>

{#await data.cards then cards}
	{#await data.reviewForm then reviewForm}
		<ReviseCards {cards} data={reviewForm} />
	{/await}
{/await}
