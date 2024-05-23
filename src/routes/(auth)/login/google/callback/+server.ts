import { OAuth2RequestError } from "arctic";
import { google, lucia } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";
import { getGoogleUserWhereEmail, insertOrUpdateGoogleUser } from "$lib/db/tables/user.table";

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const storedCodeVerifier = event.cookies.get("google_oauth_code_verifier");

	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
		const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const user = await response.json();

		const existingUser = await getGoogleUserWhereEmail(user.email);
		if (existingUser) {
			await insertOrUpdateGoogleUser({
				id: existingUser.id,
				...user
			});
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});
		} else {
			const userId = crypto.randomUUID();
			await insertOrUpdateGoogleUser({
				id: userId,
				...user
			});
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} catch (e) {
		console.log('GET ~ e:', e)
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}
