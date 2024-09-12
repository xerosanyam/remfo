import type { SelectCard } from "$lib/db/turso/remfo.turso.model";

export class CardFactory {
	static createInitialCard(): Partial<SelectCard> {
		return {
			repetitions: 0,
			interval: 1,
			easiness: 2.5,
			nextPractice: new Date()
		};
	}
}

