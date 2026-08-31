<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import CardGroup from './CardGroup.svelte';
	import ReviewProgress from './ReviewProgress.svelte';

	export let cards: CardRevisePage[];
	let groupedCards: { [key: string]: CardRevisePage[] } = {};
	let dates: string[] = [];
	let revisedCards: string[] = [];
	let remainingCards: CardRevisePage[] = [];
	let firstCardId = '';

	$: {
		remainingCards = cards.filter((card) => !revisedCards.includes(card.id));
		groupedCards = groupCards(remainingCards);
		dates = Object.keys(groupedCards).sort((b, a) => new Date(a).getTime() - new Date(b).getTime());
		firstCardId = groupCards(remainingCards)[dates[0]]?.[0]?.id;
	}

	let modifyingCardId = '';
	let error = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const id = formData.get('cardId') as string;
		revisedCards = [...revisedCards, id];
		modifyingCardId = id;
		return ({ result }: { result: ActionResult }) => {
			modifyingCardId = '';
			if (result.type === 'error' || result.type === 'failure') {
				error = 'Failed to perform that action';
				setTimeout(() => (error = ''), 4000);
			}
		};
	};

	function groupCards(cards: CardRevisePage[]): { [key: string]: CardRevisePage[] } {
		return cards.reduce((groups: { [key: string]: CardRevisePage[] }, card) => {
			const date = format(card.nextPractice, 'P');
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(card);
			return groups;
		}, {});
	}
</script>

{#if error}
	<div class="fixed right-8 top-6 z-50 rounded bg-red-700 px-4 py-3 text-white" role="status">
		{error}
	</div>
{/if}

<div class="relative mx-auto max-w-lg rounded-lg">
	<ReviewProgress {remainingCards} {revisedCards} {cards} />

	<div class="mx-4 mt-10">
		{#if cards.length > 0}
			{#each dates as date (date)}
				<CardGroup
					{firstCardId}
					{date}
					cards={groupedCards[date]}
					{customEnhance}
					{modifyingCardId}
				/>
			{/each}
		{/if}
	</div>
</div>
