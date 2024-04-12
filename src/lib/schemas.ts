import { z } from "zod";

export const cardAddSchema = z.object({
	front: z.string().trim().min(1).max(140),
	back: z.string().trim().min(1).max(140)
});
export type CardAddSchema = typeof cardAddSchema;

export const difficulty = ['Easy', 'Good', 'Hard', 'Challenging'] as const

export const cardReviewSchema = z.object({ difficulty: z.enum(difficulty).default('' as 'Hard') })
export type CardReviewSchema = typeof cardReviewSchema;