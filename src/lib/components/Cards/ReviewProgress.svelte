<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';

	export let remainingCards: CardRevisePage[];
	export let revisedCards: string[];
	export let cards: CardRevisePage[];
	export let reviseCards: number;
</script>

{#if remainingCards.length === 0}
	<div class="text-center">
		You have revised all the cards. Go to <a href="/record" class="underline">Record</a> to create more
	</div>
{:else if revisedCards.length > 0 && revisedCards.length % reviseCards === 0}
	<div class="text-center text-lg text-gray-500">
		Hurray. You revised {revisedCards.length} cards. Take a break or keep going.
	</div>
{:else}
	<div class="text-center text-lg text-gray-400">
		cards reviewed: {revisedCards.length}/{cards.length}
	</div>
{/if}
