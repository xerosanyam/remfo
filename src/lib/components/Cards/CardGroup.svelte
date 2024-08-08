<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import { humanReadableDate } from '$lib/common.util';
	import Card from './Card.svelte';

	export let date: string;
	export let cards: CardRevisePage[];
	export let customEnhance;
	export let modifyingCardId: string;
	export let firstCardId: string;
</script>

<div class="relative">
	<div class="absolute -left-14 z-10 w-12 bg-white py-2 text-center" title={date}>
		{humanReadableDate(cards[0].nextPractice)}
	</div>
	<div class="absolute -left-8 h-full border-r"></div>
	<div>
		{#each cards as card (card.id)}
			<div class={`mb-8 ${card.id === firstCardId ? 'first:min-h-screen' : ''}`}>
				<Card {card} {customEnhance} {modifyingCardId} />
			</div>
		{/each}
	</div>
</div>
