import { sql } from "$lib/db/db.util";

export const getGoogleUserWhereEmail = async (email: string) => {
	const rows = await sql`SELECT
								*
							FROM
								remfo.auth_user
							WHERE
								email = ${email};`;
	return rows[0]
}

export const insertOrUpdateGoogleUser = async ({
	id,
	name,
	given_name,
	family_name,
	picture,
	email,
	email_verified,
	locale
}: {
	id: string,
	name: string,
	given_name: string,
	family_name: string,
	picture: string,
	email: string,
	email_verified: boolean,
	locale: string
}) => {
	await sql`INSERT INTO remfo.auth_user(id,name, given_name, family_name, picture, email, email_verified, locale)
    			VALUES (${id},${name}, ${given_name}, ${family_name}, ${picture}, ${email}, ${email_verified}, ${locale})
				ON CONFLICT (id) DO UPDATE
					SET name = excluded.name,
						given_name = excluded.given_name,
						family_name = excluded.family_name,
						picture = excluded.picture,
						email = excluded.email,
						email_verified = excluded.email_verified,
						locale = excluded.locale;`;
}

