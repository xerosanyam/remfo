<script lang="ts">
	import type { CardRevisePage } from '#lib/types/Card.js';
	import { Progress } from '#lib/components/ui/progress/index.js';

	export let cards: CardRevisePage[];
	export let revisedCards: string[];
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
	<Progress value={revisedCards.length} max={cards.length || 1} />
	<div class="text-muted-foreground flex justify-between">
		<div>{progress}</div>
		<div>Reviewed: {revisedCards.length}/{cards.length}</div>
	</div>
</div>
