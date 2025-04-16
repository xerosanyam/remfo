<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SelectCard } from '$lib/db/turso.schema';
	import type { Difficulty } from '$lib/schemas';
	import type { CardRevisePage } from '$lib/types/Card';
	export let card: CardRevisePage;
	export let customEnhance;

	function calculateSuperMemo2Algorithm(card: SelectCard, difficulty: Difficulty) {
		const interval = 0;
		const difficultyMap: { [key in Difficulty]: number } = {
			Easy: 4,
			Good: 3,
			Hard: 2,
			Challenging: 1
		};
		let quality = difficultyMap[difficulty];

		if (quality < 1 || quality > 4) {
			// throw error here or ensure elsewhere that quality is always within 0-5
			quality = 3;
		}

		if (quality >= 3) {
			if (card.repetitions === 0) {
				card.interval = 1;
			} else if (card.repetitions === 1) {
				card.interval = 6;
			} else {
				card.interval = Math.round(card.interval * card.easiness);
			}
			card.repetitions += 1;
		} else {
			card.repetitions = 0;
			card.interval = 1;
		}

		// easiness factor
		card.easiness = Math.max(
			1.3,
			card.easiness + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02))
		);

		// next practice
		const millisecondsInDay = 60 * 60 * 24 * 1000;
		const now = new Date().getTime();
		card.nextPractice = new Date(now + millisecondsInDay * card.interval);

		return card;
	}

	const options = [
		{ value: 'Easy', text: 'super easy' },
		{ value: 'Good', text: 'easy' },
		{ value: 'Hard', text: 'difficult' },
		{ value: 'Challenging', text: 'super difficult' }
	];
</script>

<form method="post" action="?/review" use:enhance={customEnhance}>
	<input type="hidden" hidden name="cardId" value={card.id} />
	<div
		class="flex w-full flex-col border-t border-gray-100 sm:flex-row sm:rounded-bl-md sm:rounded-br-md"
	>
		{#each options as { value, text } (value)}
			<button
				class="w-full whitespace-nowrap border-b border-gray-100 bg-background px-4 py-4 text-center -outline-offset-2 ring-offset-background transition-colors last:rounded-b-sm hover:bg-accent hover:text-accent-foreground hover:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:border-b-0 sm:border-l sm:first:rounded-bl-sm sm:first:border-l-0 sm:last:rounded-bl-none sm:last:rounded-br-sm"
				name="difficulty"
				{value}
			>
				<span>{text}</span>
			</button>
		{/each}
	</div>
</form>
