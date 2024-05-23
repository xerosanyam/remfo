import { db } from '$lib/db/turso.db';
import { cardTable } from '$lib/db/turso.schema';
import { eq } from 'drizzle-orm';

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
	}
}
