import { lucia } from '$lib/server/auth';
import { turso_client } from '$lib/db/turso.db';
import type { Handle } from '@sveltejs/kit';
import { handleDeviceDetector } from 'sveltekit-device-detector';

const sessionAndUserInfo: { [key: string]: App.Locals } = {};

const handle: Handle = async ({ event, resolve }) => {
	const requestStart = performance.now();

	// Opt-in diagnostic: one trivial round trip to Turso from wherever this function is
	// actually running, which isolates pure network latency from anything lucia, drizzle or
	// the adapter add on top. Reached with ?__dbping on any route, and deliberately not run
	// for normal traffic, because it costs a full round trip of its own.
	//   curl -sD - -o /dev/null 'https://www.remfo.app/pricing?__dbping'
	let dbPingMs: number | null = null;
	if (event.url.searchParams.has('__dbping')) {
		const pingStart = performance.now();
		await turso_client.execute('SELECT 1');
		dbPingMs = performance.now() - pingStart;
	}

	const sessionId = event.cookies.get(lucia.sessionCookieName);

	// a cache hit skips a Turso round trip, so the header reports which one this was
	let authMs: number | null = null;
	let cacheHit = false;

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const authStart = performance.now();
		let { session, user } = sessionAndUserInfo[sessionId] || {};
		cacheHit = !!(session && user);
		if (!cacheHit) {
			({ session, user } = await lucia.validateSession(sessionId));
			sessionAndUserInfo[sessionId] = { session, user };
		}
		authMs = performance.now() - authStart;

		//session exists in db & has not expired
		if (session?.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

		// session doesn't exists in DB
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

		event.locals.user = user;
		event.locals.session = session;
	}

	const response = await resolve(event);

	// Server-Timing shows up in DevTools > Network > Timing, and is readable from JS via
	// performance.getEntriesByType('navigation')[0].serverTiming. With a streamed load,
	// resolve() returns once the shell is ready, so `shell` is the time-to-first-byte path
	// and excludes anything still streaming. The header is emitted for anonymous requests
	// too, so ?__dbping can be measured without holding a session.
	const timings = [];
	if (dbPingMs !== null) timings.push(`db;desc="SELECT 1";dur=${dbPingMs.toFixed(1)}`);
	if (authMs !== null) {
		timings.push(`auth;desc="session ${cacheHit ? 'cache' : 'db'}";dur=${authMs.toFixed(1)}`);
	}
	timings.push(`shell;dur=${(performance.now() - requestStart).toFixed(1)}`);
	response.headers.set('Server-Timing', timings.join(', '));

	return response;
};

const handleWithDeviceDetector = handleDeviceDetector({}, handle);

export { handleWithDeviceDetector as handle };
