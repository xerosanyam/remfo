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

export function authTxn<T>(
	userId: string,
	cb: (sql_authenticated: postgres.TransactionSql) => T | Promise<T>,
): Promise<T> {

	return sql_postgres.begin(async (sql) => {
		await sql`SET LOCAL ROLE authenticated`
		await sql`SELECT set_config('request.jwt.claim.sub', ${userId}, TRUE)`;

		return cb(sql);
	}) as Promise<T>;
}
