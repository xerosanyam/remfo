import { db } from '$lib/db/turso.db';
import { userTable } from '$lib/db/turso.schema';
import { eq } from 'drizzle-orm';

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