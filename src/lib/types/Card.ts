export type CardEssentials = {
	id: string;
	front: string;
	back: string;
	createdAt: Date;
}

// see the type +page.svelte is getting from backend and then update it here
export type CardRevisePage = {
	id: string;
	front: string;
	back: string;
	createdAt: Date;
	nextPractice: Date;
	interval: number;
	repetitions: number;
	easiness: number;
}