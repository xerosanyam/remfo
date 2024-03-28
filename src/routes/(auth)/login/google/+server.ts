import { generateCodeVerifier, generateState } from "arctic";

import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import { dev } from "$app/environment";

import { google } from "$lib/server/auth";


export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: [
			"profile",
			"email"
		]
	});

	event.cookies.set("google_oauth_state", state, {
		path: "/",
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	event.cookies.set("google_oauth_code_verifier", codeVerifier, {
		path: "/",
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	redirect(302, url);
}