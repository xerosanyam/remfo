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
	<div
		class="mb-2 flex h-10 w-16 items-center justify-center rounded-full border border-slate-200 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300"
		title={date}
	>
		{humanReadableDate(cards[0].nextPractice)}
	</div>
	<div
		class="absolute left-8 top-10 -z-10 h-full border-r border-slate-200 dark:border-slate-700"
	></div>
	{#each cards as card (card.id)}
		<div class="{`mb-16 ${card.id === firstCardId ? 'first:min-h-screen' : ''}`}}">
			<Card {card} {customEnhance} {modifyingCardId}></Card>
		</div>
	{/each}
</div>
