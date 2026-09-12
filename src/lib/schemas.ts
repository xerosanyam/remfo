import { z } from 'zod';

export const cardAddSchema = z.object({
	front: z.string().trim().min(1).max(2000),
	back: z.string().trim().min(1).max(2000)
});
export type CardAddSchema = typeof cardAddSchema;

export const difficulty = ['Easy', 'Good', 'Hard', 'Challenging'] as const;
export type Difficulty = (typeof difficulty)[number];

export const cardReviewSchema = z.object({
	cardId: z.string(),
	difficulty: z.enum(difficulty).default('' as 'Hard')
});

export type CardReviewSchema = typeof cardReviewSchema;

export const cardLearnSchema = z.object({
	userInput: z.string().trim().min(1).max(140)
});
export type CardLearnSchema = typeof cardLearnSchema;

// Posted by the /pomo timer rather than typed into a form, so this is a trust boundary with no
// validation messages to render: reject nonsense, do not try to explain it.
export const pomodoroRecordSchema = z
	.object({
		duration: z
			.number()
			.int()
			.min(60)
			.max(24 * 60 * 60),
		startedAt: z.number().int().positive(),
		endedAt: z.number().int().positive(),
		// Not z.coerce.boolean(): the body is JSON so this arrives already typed, and coercion
		// would turn the string "false" into true.
		completed: z.boolean()
	})
	// startedAt is deliberately unbounded in the past: a session run logged out can be claimed
	// weeks later. The future is what has to be shut, or a client could book focus time it has
	// not spent yet.
	.refine(({ endedAt }) => endedAt <= Date.now() / 1000 + 60, 'session ends in the future')
	.refine(({ startedAt, endedAt }) => endedAt >= startedAt, 'session ends before it starts')
	.refine(
		({ startedAt, endedAt, duration }) => endedAt - startedAt <= duration,
		'session ran longer than its own duration'
	);
export type PomodoroRecordSchema = typeof pomodoroRecordSchema;
