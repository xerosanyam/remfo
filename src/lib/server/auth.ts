import { dev } from "$app/environment";
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	REDIRECT_URI
} from "$env/static/private";

import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";

import { Google } from "arctic";

import { sql_postgres } from "$lib/db/db.util";


const adapter = new PostgresJsAdapter(sql_postgres, {
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
			name: attributes.given_name,
			picture: attributes.picture
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
	given_name: string;
	picture: string;
}

export const google = new Google(
	GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI
)