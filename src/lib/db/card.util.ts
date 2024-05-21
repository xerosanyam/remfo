import { sql_postgres } from '$lib/db/db.util';

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
		console.time('insertCard')
		const query = sql_postgres`INSERT INTO remfo.card(id, front, back, user_id)
  				VALUES (${id}, ${front}, ${back}, ${user_id})`;
		await query
		console.timeEnd('insertCard')
	} catch (err) {
		console.error('insertCard ~ err:', err)
	}
};

export const getCards = async (user_id: string) => {
	try {
		console.time('getCards')
		const query = sql_postgres`select id from remfo.card where user_id=${user_id}`
		const data = await query
		console.timeEnd('getCards')
		return data
	} catch (err) {
		console.error('getCards ~ err:', err)
		return []
	}
}

export const deleteCard = async ({ user_id, card_id }: { user_id: string, card_id: string }) => {
	try {
		console.time('deleteCard')
		const query = sql_postgres`delete from remfo.card where id = ${card_id} and user_id = ${user_id}`;
		await query
		console.timeEnd('deleteCard')
	} catch (err) {
		console.error('deleteCard ~ err:', err)
	}
}