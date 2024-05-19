import { authTxn, sql_postgres } from '$lib/db/db.util';
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
		console.time('getCards')
		const query =  sql_postgres`select * from remfo.card where user_id=${user_id}`
		const data = await query
		console.timeEnd('getCards')
		return data
	} catch (err) {
		console.error('getCards ~ err:', err)
	}
}
