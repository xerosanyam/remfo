import { dev } from '$app/environment';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } from '$env/static/private';

import type { Cookies } from '@sveltejs/kit';
import { getGoogleUserWhereEmail, insertOrUpdateGoogleUser } from '$lib/db/tables/user.table';

import { Lucia } from 'lucia';
import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite';

import { Google } from 'arctic';

import { turso_client } from '$lib/db/turso.db';

const adapter = new LibSQLAdapter(turso_client, {
	user: 'auth_user',
	session: 'user_session'
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

declare module 'lucia' {
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

export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

// Shared by both ways in: the redirect callback and the device flow. Given a Google access
// token, upsert the user and put a session cookie on the response. Kept in one place so the
// two entry points cannot drift on how a session is established.
export async function createSessionFromGoogleToken(accessToken: string, cookies: Cookies) {
	const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	const user = await response.json();

	const existingUser = await getGoogleUserWhereEmail(user.email);
	const userId = existingUser ? existingUser.id : crypto.randomUUID();
	await insertOrUpdateGoogleUser({ id: userId, ...user });

	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
}
