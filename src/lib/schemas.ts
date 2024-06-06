import { z } from "zod";

export const cardAddSchema = z.object({
	front: z.string().trim().min(1).max(2000),
	back: z.string().trim().min(1).max(2000)
});
export type CardAddSchema = typeof cardAddSchema;


export const difficulty = ['Easy', 'Good', 'Hard', 'Challenging'] as const
export type Difficulty = typeof difficulty[number]

export const cardReviewSchema = z.object({
	cardId: z.string(),
	difficulty: z.enum(difficulty).default('' as 'Hard')
})

export type CardReviewSchema = typeof cardReviewSchema;


export const cardLearnSchema = z.object({
	userInput: z.string().trim().min(1).max(140)
})
export type CardLearnSchema = typeof cardLearnSchema;
