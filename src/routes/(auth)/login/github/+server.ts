import { generateState } from "arctic";

import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

import { dev } from "$app/environment";

import { github } from "$lib/server/auth";


export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const url = await github.createAuthorizationURL(state);

	event.cookies.set("github_oauth_state", state, {
		path: "/",
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	redirect(302, url);
}