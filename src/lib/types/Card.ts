export type CardEssentials = {
	id: string;
	front: string;
	back: string;
	createdAt: Date;
}

export type CardRevisePage = CardEssentials & {
	nextPractice: Date;
}