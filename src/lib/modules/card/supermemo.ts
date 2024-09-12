import type { SelectCard } from "$lib/db/turso/remfo.turso.model";
import type { Difficulty } from "$lib/schemas";
export interface SpacedRepetitionStrategy {
	calculate(card: SelectCard, difficulty: Difficulty): SelectCard;
}

export class SuperMemo2Strategy {
	calculate(card: SelectCard, difficulty: Difficulty): SelectCard {
		const difficultyMap: { [key in Difficulty]: number } = { 'Easy': 4, 'Good': 3, 'Hard': 2, 'Challenging': 1 };
		let quality = difficultyMap[difficulty];

		if (quality < 1 || quality > 4) {
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

		card.easiness = Math.max(1.3, card.easiness + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02)));

		const millisecondsInDay = 60 * 60 * 24 * 1000;
		const now = new Date().getTime();
		card.nextPractice = new Date(now + millisecondsInDay * card.interval);

		return card;
	}
}
