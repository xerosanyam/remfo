import { CONNECTION_STRING } from '$env/static/private';
import postgres from 'postgres';

// be cautious while using sql_postgres. it bypasses RLS.
export const sql_postgres = postgres(CONNECTION_STRING, {
	prepare: false,
	connection: {
		search_path: 'remfo',
	},
});

async function shutdownGracefully() {
	await sql_postgres.end()
}

process.on('exit', shutdownGracefully);

export const testConnection = async () => {
	try {
		const rows = await sql_postgres`SELECT NOW()`;
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
