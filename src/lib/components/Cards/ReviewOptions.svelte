<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Difficulty } from '$lib/schemas';
	import type { CardRevisePage } from '$lib/types/Card';
	import { formatDistanceToNow } from 'date-fns';
	export let card: CardRevisePage;
	export let customEnhance;

	function calculateSuperMemo2Algorithm(card: CardRevisePage, difficulty: Difficulty) {
		let interval;
		let repetitions;
		let easiness;
		let nextPractice;

		const difficultyMap: { [key in Difficulty]: number } = {
			SuperEasy: 5,
			Easy: 4,
			Good: 3,
			Hard: 2,
			Challenging: 1
		};
		let quality = difficultyMap[difficulty];
		console.log('calculateSuperMemo2Algorithm ~ quality:', quality);

		if (quality < 1 || quality > 5) {
			// throw error here or ensure elsewhere that quality is always within 0-5
			quality = 3;
		}
		console.log('calculateSuperMemo2Algorithm ~ quality:', quality);

		if (quality >= 3) {
			if (card.repetitions === 0) {
				interval = 1;
			} else if (card.repetitions === 1) {
				interval = 6;
			} else {
				interval = Math.round(card.interval * card.easiness);
			}
			repetitions = card.repetitions + 1;
		} else {
			repetitions = 0;
			interval = 1;
		}

		// easiness factor
		easiness = Math.max(
			1.3,
			card.easiness + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02))
		);
		console.log('as', interval, repetitions, easiness);

		// next practice
		const millisecondsInDay = 60 * 60 * 24 * 1000;
		const now = new Date().getTime();
		nextPractice = now + millisecondsInDay * interval;
		console.log('calculateSuperMemo2Algorithm ~ nextPractice:', nextPractice);
		return nextPractice;
	}

	console.log('card', card);

	const options = [
		{
			value: 'SuperEasy',
			text: 'super easy',
			nextPractice: calculateSuperMemo2Algorithm(card, 'SuperEasy')
		},
		{ value: 'Easy', text: 'super easy', nextPractice: calculateSuperMemo2Algorithm(card, 'Easy') },
		{ value: 'Good', text: 'easy', nextPractice: calculateSuperMemo2Algorithm(card, 'Good') },
		{ value: 'Hard', text: 'difficult', nextPractice: calculateSuperMemo2Algorithm(card, 'Hard') },
		{
			value: 'Challenging',
			text: 'super difficult',
			nextPractice: calculateSuperMemo2Algorithm(card, 'Challenging')
		}
	];
</script>

<form method="post" action="?/review" use:enhance={customEnhance}>
	<input type="hidden" hidden name="cardId" value={card.id} />
	<div
		class="flex w-full flex-col border-t border-gray-100 sm:flex-row sm:rounded-bl-md sm:rounded-br-md"
	>
		{#each options as { value, text, nextPractice } (value)}
			<button
				class="w-full whitespace-nowrap border-b border-gray-100 bg-background px-4 py-4 text-center -outline-offset-2 ring-offset-background transition-colors last:rounded-b-sm hover:bg-accent hover:text-accent-foreground hover:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:border-b-0 sm:border-l sm:first:rounded-bl-sm sm:first:border-l-0 sm:last:rounded-bl-none sm:last:rounded-br-sm"
				name="difficulty"
				{value}
			>
				<span>{text} {formatDistanceToNow(nextPractice)}</span>
			</button>
		{/each}
	</div>
</form>
