import { db } from '$lib/db/turso.db';
import { cardTable } from '$lib/db/turso.schema';
import { and, eq } from 'drizzle-orm';

export const insertCard = async (values: {
	id: string;
	front: string;
	back: string;
	userId: string;
}) => {
	try {
		console.time('insertCard')
		await db.insert(cardTable).values(values)
		console.timeEnd('insertCard')
	} catch (err) {
		console.error('insertCard ~ err:', err)
	}
};

export const getCards = async (userId: string) => {
	try {
		console.time('getCards')
		const data = await db.select().from(cardTable).where(eq(cardTable.userId, userId))
		console.timeEnd('getCards')
		return data
	} catch (err) {
		console.error('getCards ~ err:', err)
		return []
	}
}

export const deleteCard = async ({ cardId, userId }: { cardId: string, userId: string }) => {
	try {
		console.time('deleteCard')
		await db.delete(cardTable).where(and(eq(cardTable.id, cardId), eq(cardTable.userId, userId)))
		console.timeEnd('deleteCard')
	} catch (err) {
		console.error('deleteCard ~ err:', err)
	}
}