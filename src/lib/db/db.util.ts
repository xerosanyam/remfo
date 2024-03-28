import { CONNECTION_STRING } from '$env/static/private';
import postgres from 'postgres';

export const sql = postgres(CONNECTION_STRING, {
	prepare: false,
	connection: {
		search_path: 'remfo',
	},
});

export const testConnection = async () => {
	try {
		const rows = await sql`SELECT NOW()`;
		console.info(rows[0]);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
