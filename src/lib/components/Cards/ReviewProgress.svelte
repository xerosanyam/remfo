<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';

	export let cards: CardRevisePage[];
	export let revisedCards: string[];
	export let remainingCards: CardRevisePage[];
	let progress = '0';
	$: {
		if (cards.length === 0) {
			progress = '100%';
		} else {
			progress = `${((revisedCards.length * 100) / cards.length).toFixed(2)}%`;
		}
	}
</script>

<div>
	<div class="h-2 w-full bg-gray-200">
		<div style={`width:${progress}`} class={`h-full w-0 bg-gray-400`}></div>
	</div>
	<div class="flex justify-between text-gray-400">
		<div>{progress}</div>
		<div>Reviewed: {revisedCards.length}/{cards.length}</div>
	</div>
</div>

{#if remainingCards.length === 0}
	<div class="mt-20 text-center">
		You have revised all the cards. Go to <a href="/record" class="underline">Record</a> to create more
	</div>
{/if}
