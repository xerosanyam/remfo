import { sql } from '$lib/db/db.util';

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
		await sql`INSERT INTO remfo.card(id, front, back, user_id)
  				VALUES (${id}, ${front}, ${back}, ${user_id})`;
	} catch (err) {
		console.error('insertCard ~ err:', err)
	}
};
