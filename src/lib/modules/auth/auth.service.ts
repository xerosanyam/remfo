import { dev } from "$app/environment";
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	REDIRECT_URI,
} from "$env/static/private";

import { Lucia } from "lucia";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";

import { Google } from "arctic";
import { turso_client } from "$lib/db/turso/turso.service";



const adapter = new LibSQLAdapter(turso_client, {
	user: "auth_user",
	session: "user_session"
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
			picture: attributes.picture,
			email: attributes.email
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
	email: string;
}

export const GoogleClient = new Google(
	GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI
)