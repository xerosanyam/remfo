<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import CardGroup from './CardGroup.svelte';
	import ReviewProgress from './ReviewProgress.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	export let cards: CardRevisePage[];
	let groupedCards: { [key: string]: CardRevisePage[] } = {};
	let dates: string[] = [];
	let revisedCards: string[] = [];
	let remainingCards: CardRevisePage[] = [];

	$: {
		remainingCards = cards.filter((card) => !revisedCards.includes(card.id));
		groupedCards = groupCards(remainingCards);
		dates = Object.keys(groupedCards).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
	}

	let modifyingCardId = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const id = formData.get('cardId') as string;
		revisedCards = [...revisedCards, id];
		modifyingCardId = id;
		return ({ result }: { result: ActionResult }) => {
			modifyingCardId = '';
			if (result.type === 'error' || result.type === 'failure') {
				toast.push('Failed to perform that action', {
					theme: {
						'--toastColor': 'white',
						'--toastBackground': 'rgba(220,53,69,0.9)',
						'--toastBarBackground': '#C53030'
					}
				});
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

	let reviseCards = 5;
</script>

<div class="relative mx-auto mt-10 max-w-lg space-y-4 rounded-lg">
	<ReviewProgress {remainingCards} {revisedCards} {cards} {reviseCards} />

	<div class="mt-10">
		{#if cards.length > 0}
			{#each dates as date (date)}
				<CardGroup {date} cards={groupedCards[date]} {customEnhance} {modifyingCardId} />
			{/each}
		{/if}
	</div>
</div>
