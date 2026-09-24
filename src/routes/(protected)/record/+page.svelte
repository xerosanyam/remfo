<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';

	export let data;
</script>

<svelte:head>
	<title>Remfo | Record</title>
</svelte:head>

<AddNewCard formData={data.addForm} />

{#if data.cards}
	<NewCards cards={data.cards.cards} totalCards={data.cards.totalCards} limit={data.limit} />
{:else}
	<div class="pb-10 pt-24 text-center text-sm text-slate-500 dark:text-slate-300">
		could not load your cards.
	</div>
{/if}
