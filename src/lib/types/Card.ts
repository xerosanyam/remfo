export type CardEssentials = {
	id: string;
	front: string;
	back: string;
	createdAt: Date;
	updatedAt: Date;
}

export type Card = CardEssentials & {
	userId: string;
	easiness: number;
	interval: number;
	repetitions: number;
	nextPractice: Date;
}