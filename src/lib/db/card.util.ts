import { authTxn } from '$lib/db/db.util';
import type postgres from 'postgres';

export const insertCard = async ({
	id,
	front,
	back,
	user_id
}: {
	id: string;
	front: string;
	back: string;
	user_id: string;
}) => {
	try {
		const query = (sql: postgres.TransactionSql) => sql`INSERT INTO remfo.card(id, front, back, user_id)
  				VALUES (${id}, ${front}, ${back}, ${user_id})`;
		await authTxn(user_id, query)
	} catch (err) {
		console.error('insertCard ~ err:', err)
	}
};

export const getCards = async (user_id: string) => {
	try {
		const query = (sql: postgres.TransactionSql) => sql`select * from remfo.card`;
		const data = await authTxn(user_id, query)
		return data
	} catch (err) {
		console.error('getCards ~ err:', err)
	}
}
