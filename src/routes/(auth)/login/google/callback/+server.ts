import { OAuth2RequestError } from 'arctic';
import { createSessionFromGoogleToken, google } from '$lib/server/auth';

import type { RequestEvent } from '@sveltejs/kit';
import { ROUTES } from '$lib/routes.util';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const storedCodeVerifier = event.cookies.get('google_oauth_code_verifier');

	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	// Single-use secrets, so they go as soon as they have been read. Leaving them behind also
	// muddies the signal the login page uses to notice an attempt that never came back.
	event.cookies.delete('google_oauth_state', { path: '/' });
	event.cookies.delete('google_oauth_code_verifier', { path: '/' });

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
		await createSessionFromGoogleToken(tokens.accessToken, event.cookies);
		return new Response(null, {
			status: 302,
			headers: {
				Location: ROUTES.HOME
			}
		});
	} catch (e) {
		console.error('google auth:', e);
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
