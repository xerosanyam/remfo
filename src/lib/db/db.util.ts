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

export async function authTxn<T>(
	userId: string,
	cb: (sql_authenticated: postgres.TransactionSql) => T | Promise<T>,
): Promise<T> {
	console.time('authTxn')
	let data
	await sql_postgres.begin(async (sql) => {
		console.time('set-role')
		await sql`SET LOCAL ROLE authenticated`
		console.timeEnd('set-role')
		console.time('set-config')
		await sql`SELECT set_config('request.jwt.claim.sub', ${userId}, TRUE)`;
		console.timeEnd('set-config')
		console.time('cb')
		data = await cb(sql);
		console.timeEnd('cb')
	})
	console.timeEnd('authTxn')
	return data as T;
}
