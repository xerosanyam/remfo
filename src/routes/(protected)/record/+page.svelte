<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';

	export let data;
</script>

<AddNewCard formData={data.addForm} />

{#if data.cards}
	<NewCards cards={data.cards.cards} totalCards={data.cards.totalCards} limit={data.limit} />
{:else}
	<div class="pb-10 pt-24 text-center text-sm text-gray-500">could not load your cards.</div>
{/if}
