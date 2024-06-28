import { db } from '$lib/db/turso.db';
import { activityTable, cardTable, type SelectCard } from '$lib/db/turso.schema';
import type { Difficulty } from '$lib/schemas';
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

export const getCardsOrderByCreated = async (userId: string) => {
	console.time('getCards')
	const data = await db.select({ id: cardTable.id, front: cardTable.front, back: cardTable.back, createdAt: cardTable.createdAt }).from(cardTable).where(and(eq(cardTable.userId, userId), eq(cardTable.deleted, false))).orderBy(desc(cardTable.createdAt))
	console.timeEnd('getCards')
	return data
}

// export const getCardsGroupedByCreated = async (userId: string) => {
// 	console.time('getCardsGroupedByCreated')
// 	const data = await db.select({ date: sql`DATE(${activityTable.createdAt}, 'unixepoch')`, count: count() }).from(activityTable).where(and(eq(activityTable.userId, userId), eq(activityTable.action, 'INSERT'))).groupBy(sql`DATE(${activityTable.createdAt}, 'unixepoch')`)
// 	console.timeEnd('getCardsGroupedByCreated')
// 	return data
// }

// export const getCardsGroupedByUpdated = async (userId: string) => {
// 	console.time('getCardsGroupedByUpdated')
// 	const data = await db.select({ date: sql`DATE(${activityTable.createdAt}, 'unixepoch')`, count: count() }).from(activityTable).where(and(eq(activityTable.userId, userId), eq(activityTable.action, 'UPDATE'))).groupBy(sql`DATE(${activityTable.createdAt}, 'unixepoch')`)
// 	console.timeEnd('getCardsGroupedByUpdated')
// 	return data
// }

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

// export const getTotalCards = async (userId: string) => {
// 	console.time('getTotalCard')
// 	const data = await db.select({ count: count() }).from(cardTable).where(eq(cardTable.userId, userId))
// 	console.log('getTotalCards ~ data:', data)
// 	console.timeEnd('getTotalCard')
// 	return data[0]?.count || 0
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


function calculateSuperMemo2Algorithm(card: SelectCard, difficulty: Difficulty) {
	const difficultyMap: { [key in Difficulty]: number } = { 'Easy': 4, 'Good': 3, 'Hard': 2, 'Challenging': 1 }
	let quality = difficultyMap[difficulty]

	if (quality < 1 || quality > 4) {
		// throw error here or ensure elsewhere that quality is always within 0-5
		quality = 3
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

	// easiness factor
	card.easiness = Math.max(1.3, card.easiness + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02)))

	// next practice
	const millisecondsInDay = 60 * 60 * 24 * 1000
	const now = new Date().getTime()
	card.nextPractice = new Date(now + millisecondsInDay * card.interval)

	return card
}