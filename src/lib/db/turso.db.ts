import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from '$env/static/private';
import { userTable } from '$lib/db/turso.schema';
import { eq } from 'drizzle-orm';

export const turso_client = createClient({
	url: TURSO_CONNECTION_URL,
	authToken: TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso_client);

export const getGoogleUserWhereEmail = async (email: string) => {
	const rows = await db.select().from(userTable).where(eq(userTable.email, email))
	return rows[0]
}

export const insertOrUpdateGoogleUser = async (values: {
	id: string,
	name: string,
	given_name: string,
	family_name: string,
	picture: string,
	email: string,
	email_verified: boolean,
	locale: string
}) => {
	await db.insert(userTable).values(values).onConflictDoUpdate({ target: userTable.id, set: { ...values } });
}