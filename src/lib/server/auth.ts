import { dev } from "$app/environment";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";

import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";

import { GitHub } from "arctic";

import { sql } from "$lib/db/db.util";


const adapter = new PostgresJsAdapter(sql, {
	user: "remfo.auth_user",
	session: "remfo.user_session"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			githubId: attributes.github_id,
			username: attributes.username
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	github_id: string;
	username: string;
}


export const github = new GitHub(
	GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
);
