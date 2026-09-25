<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import Card from './Card.svelte';
	import ReviewProgress from './ReviewProgress.svelte';
	import { capture } from '$lib/posthog';

	export let cards: CardRevisePage[];
	let revisedCards: string[] = [];
	let remainingCards: CardRevisePage[] = [];

	$: remainingCards = cards.filter((card) => !revisedCards.includes(card.id));

	let modifyingCardId = '';
	let error = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const id = formData.get('cardId') as string;
		const difficulty = formData.get('difficulty');
		revisedCards = [...revisedCards, id];
		modifyingCardId = id;
		return async ({ result }: { result: ActionResult }) => {
			modifyingCardId = '';
			if (result.type === 'success' && difficulty) {
				void capture('flashcard_reviewed', { difficulty });
			}
			if (result.type === 'error' || result.type === 'failure') {
				error = 'Failed to perform that action';
				setTimeout(() => (error = ''), 4000);
			} else if (remainingCards.length === 0) {
				revisedCards = [];
				await invalidateAll();
			}
		};
	};
</script>

{#if error}
	<div class="fixed top-6 right-8 z-50 rounded-sm bg-red-700 px-4 py-3 text-white" role="status">
		{error}
	</div>
{/if}

<div class="relative mx-auto max-w-lg rounded-lg">
	<ReviewProgress {revisedCards} {cards} />

	<div class="mx-4 mt-10">
		{#if remainingCards[0]}
			<Card card={remainingCards[0]} {customEnhance} {modifyingCardId} />
		{/if}
	</div>
</div>
