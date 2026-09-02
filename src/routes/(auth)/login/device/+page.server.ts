import { fail, redirect } from '@sveltejs/kit';
import { GOOGLE_DEVICE_CLIENT_ID, GOOGLE_DEVICE_CLIENT_SECRET } from '$env/static/private';

import { dev } from '$app/environment';
import { ROUTES } from '$lib/routes.util.js';
import { sessionExists } from '$lib/common.util.js';
import { createSessionFromGoogleToken } from '$lib/server/auth';

// OAuth 2.0 Device Authorization Grant (RFC 8628). Google's normal sign-in page refuses some
// browsers outright, telling the user their browser has JavaScript disabled when it does not.
// Here the browser only ever DISPLAYS a code; the user approves on a phone, and this server
// does the token exchange. Nothing on Google's domain is ever loaded by the limited browser.
const DEVICE_CODE_URL = 'https://oauth2.googleapis.com/device/code';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DEVICE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';
const FLOW_COOKIE = 'google_device_flow';

type Flow = {
	deviceCode: string;
	userCode: string;
	verificationUrl: string;
	expiresAt: number;
	intervalSeconds: number;
};

const flowCookieOptions = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax'
} as const;

function readFlow(cookies: { get: (name: string) => string | undefined }): Flow | null {
	const raw = cookies.get(FLOW_COOKIE);
	if (!raw) return null;
	try {
		const flow = JSON.parse(raw) as Flow;
		return flow.expiresAt > Date.now() ? flow : null;
	} catch {
		return null;
	}
}

export async function load({ locals, cookies }) {
	if (sessionExists(locals)) {
		redirect(302, ROUTES.HOME);
	}

	// Reuse a code that is still alive, so refreshing the page (or an early "continue" that
	// came back as still-pending) does not burn a new code and change what the user is
	// halfway through typing on their phone.
	let flow = readFlow(cookies);

	if (!flow) {
		const response = await fetch(DEVICE_CODE_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: GOOGLE_DEVICE_CLIENT_ID,
				scope: 'email profile'
			})
		});
		if (!response.ok) {
			console.error('device code request failed:', response.status, await response.text());
			return { unavailable: true };
		}
		const data = await response.json();
		flow = {
			deviceCode: data.device_code,
			userCode: data.user_code,
			verificationUrl: data.verification_url,
			expiresAt: Date.now() + data.expires_in * 1000,
			// google's minimum seconds between checks; the page polls no faster than this
			intervalSeconds: data.interval ?? 5
		};
		cookies.set(FLOW_COOKIE, JSON.stringify(flow), {
			...flowCookieOptions,
			maxAge: data.expires_in
		});
	}

	return {
		unavailable: false,
		userCode: flow.userCode,
		verificationUrl: flow.verificationUrl,
		expiresAt: flow.expiresAt,
		intervalSeconds: flow.intervalSeconds ?? 5
	};
}

export const actions = {
	// The "I have approved it" button. A device would normally poll for this, but polling
	// needs JavaScript, which is the one thing these browsers cannot be relied on for. So the
	// person is the poll: they press the button once they have approved on their phone.
	default: async ({ cookies }) => {
		const flow = readFlow(cookies);
		if (!flow) {
			return fail(400, { expired: true });
		}

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: GOOGLE_DEVICE_CLIENT_ID,
				client_secret: GOOGLE_DEVICE_CLIENT_SECRET,
				device_code: flow.deviceCode,
				grant_type: DEVICE_GRANT
			})
		});
		const data = await response.json();

		if (!response.ok) {
			// 428 authorization_pending simply means they have not finished on their phone yet,
			// which is the expected state for an eager press and is not an error worth shouting
			// about. slow_down is the same thing with a rate-limit hint attached.
			if (data.error === 'authorization_pending' || data.error === 'slow_down') {
				// RFC 8628 says slow_down means back off, so the page widens its own interval
				return fail(400, { pending: true, slowDown: data.error === 'slow_down' });
			}
			cookies.delete(FLOW_COOKIE, { path: '/' });
			if (data.error === 'expired_token') return fail(400, { expired: true });
			if (data.error === 'access_denied') return fail(400, { denied: true });
			console.error('device token exchange failed:', response.status, data);
			return fail(500, { failed: true });
		}

		cookies.delete(FLOW_COOKIE, { path: '/' });
		await createSessionFromGoogleToken(data.access_token, cookies);
		redirect(302, ROUTES.HOME);
	}
};
