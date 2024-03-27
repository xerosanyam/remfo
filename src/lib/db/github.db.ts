import { sql } from "$lib/db/db.util";

export const getGithubUserWhereId = async (id: string) => {
	const rows = await sql`SELECT
								*
							FROM
								remfo.auth_user
							WHERE
								github_id = ${id};`;
	return rows[0]
}

export const insertGithubUser = async ({ id, github_id, username }: {
	id: string,
	github_id: string,
	username: string
}) => {
	await sql`INSERT INTO remfo.auth_user(id, github_id, username)
    			VALUES (${id}, ${github_id}, ${username})`;
}