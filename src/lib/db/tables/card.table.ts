import { db } from '$lib/db/turso.db';
import { activityTable, cardTable } from '$lib/db/turso.schema';
import type { Difficulty } from '$lib/schemas';
import { calculateSuperMemo2Algorithm } from '$lib/algo.utils';
import { and, count, desc, eq, lt, sql, } from 'drizzle-orm';

// const initialCard = {
// 	repetitions: 0,
// 	interval: 1,
// 	easiness: 2.5,
// 	nextPractice: new Date()
// };

export const insertCard = async (values: {
	id: string;
	front: string;
	back: string;
	userId: string;
}) => {
	console.time('insertCard')
	await db.insert(cardTable).values(values)
	console.timeEnd('insertCard')
};

// export const getCards = async (userId: string) => {
// 	console.time('getCards')
// 	const data = await db.select().from(cardTable).where(eq(cardTable.userId, userId)).orderBy(cardTable.nextPractice)
// 	console.timeEnd('getCards')
// 	return data
// }

export const getCardsOrderByCreated = async (userId: string, limit: number) => {
	console.time('getCards')
	const data = await db.select({ id: cardTable.id, front: cardTable.front, back: cardTable.back, createdAt: cardTable.createdAt }).from(cardTable).where(and(eq(cardTable.userId, userId), eq(cardTable.deleted, false))).orderBy(desc(cardTable.createdAt)).limit(limit)
	console.timeEnd('getCards')
	return data
}

export const getTotalCards = async (userId: string) => {
	console.time('getTotalCards')
	const data = await db.select({ count: count() }).from(cardTable).where(and(eq(cardTable.userId, userId), eq(cardTable.deleted, false)))
	console.timeEnd('getTotalCards')
	return data[0]?.count ?? 0
}

export const getCardsRecorded = async (userId: string) => {
	console.time('getCardsGroupedByCreated')
	const data = await db.select({ date: activityTable.createdAt }).from(activityTable).where(and(eq(activityTable.userId, userId), eq(activityTable.action, 'INSERT')))
	console.timeEnd('getCardsGroupedByCreated')
	return data
}

export const getCardsReviewed = async (userId: string) => {
	console.time('getCardsGroupedByUpdated')
	const data = await db.select({ date: activityTable.createdAt }).from(activityTable).where(and(eq(activityTable.userId, userId), eq(activityTable.action, 'UPDATE')))
	console.timeEnd('getCardsGroupedByUpdated')
	return data
}

export const getCardsGroupedByActivityDate = async (userId: string) => {
	console.time('getCardsGroupedByActivityDate')
	const data = await db.select({ date: sql`DATE(${activityTable.createdAt}, 'unixepoch')`, count: count() }).from(activityTable).where(eq(activityTable.userId, userId)).groupBy(sql`DATE(${activityTable.createdAt}, 'unixepoch')`)
	console.timeEnd('getCardsGroupedByActivityDate')
	return data
}



export const getCardsOrderByNextPractice = async (userId: string) => {
	console.time('getCards')
	const data = await db.select({ id: cardTable.id, front: cardTable.front, back: cardTable.back, createdAt: cardTable.createdAt, nextPractice: cardTable.nextPractice }).from(cardTable).where(and(eq(cardTable.userId, userId), lt(cardTable.nextPractice, new Date()), eq(cardTable.deleted, false))).orderBy(cardTable.nextPractice)
	console.timeEnd('getCards')
	return data
}

// export const getCard = async (userId: string) => {
// 	console.time('getCard')
// 	const data = await db.select().from(cardTable).where(eq(cardTable.userId, userId)).orderBy(cardTable.nextPractice).limit(1)
// 	console.timeEnd('getCard')
// 	return data[0] || {}
// }

export const deleteCard = async ({ cardId, userId }: { cardId: string, userId: string }) => {
	console.time('deleteCard')
	await db.update(cardTable).set({ deleted: true }).where(and(eq(cardTable.id, cardId), eq(cardTable.userId, userId)))
	console.timeEnd('deleteCard')
}

// export const resetCard = async ({ cardId, userId }: { cardId: string, userId: string }) => {
// 	await db.update(cardTable).set(initialCard).where(and(eq(cardTable.id, cardId), eq(cardTable.userId, userId)))
// }

export const reviewCard = async ({ cardId, userId, difficulty }: { cardId: string, userId: string, difficulty: Difficulty }) => {
	const cards = await db.select().from(cardTable).where(and(eq(cardTable.id, cardId), eq(cardTable.userId, userId)))
	let card = cards[0]

	card = calculateSuperMemo2Algorithm(card, difficulty)
	console.time('reviewCard')
	await db.update(cardTable).set(card).where(and(eq(cardTable.id, cardId), eq(cardTable.userId, userId)))
	console.timeEnd('reviewCard')
}
