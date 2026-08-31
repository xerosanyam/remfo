<script lang="ts">
	import type { CardEssentials } from '$lib/types/Card';
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';

	export let data;

	// data.cards is a fresh promise after every add or delete, which would drop the list back
	// to the pending block for a round trip. Remember the last resolved payload so the pending
	// branch can keep the previous list on screen instead of blanking it.
	let shown: { cards: CardEssentials[]; totalCards: number } | null = null;
	$: data.cards.then((value) => (shown = value)).catch(() => {});
</script>

<AddNewCard formData={data.addForm} />

{#await data.cards}
	{#if shown}
		<NewCards cards={shown.cards} totalCards={shown.totalCards} limit={data.limit} />
	{:else}
		<div class="pb-10 pt-24 text-center text-sm text-gray-500">loading cards...</div>
	{/if}
{:then { cards, totalCards }}
	<NewCards {cards} {totalCards} limit={data.limit} />
{:catch}
	<div class="pb-10 pt-24 text-center text-sm text-gray-500">could not load your cards.</div>
{/await}
