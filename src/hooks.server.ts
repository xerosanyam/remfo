import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { handleDeviecDetector } from 'sveltekit-device-detector';

const sessionAndUserInfo: { [key: string]: App.Locals } = {};

const handle: Handle = async ({ event, resolve }) => {
	const requestStart = performance.now();
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const authStart = performance.now();
	let { session, user } = sessionAndUserInfo[sessionId] || {};
	// a cache hit skips a Turso round trip, so the header reports which one this was
	const cacheHit = !!(session && user);
	if (!cacheHit) {
		({ session, user } = await lucia.validateSession(sessionId));
		sessionAndUserInfo[sessionId] = { session, user };
	}
	const authMs = performance.now() - authStart;

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

	const response = await resolve(event);

	// Server-Timing shows up in DevTools > Network > Timing, and is readable from JS via
	// performance.getEntriesByType('navigation')[0].serverTiming. With a streamed load,
	// resolve() returns once the shell is ready, so `shell` is the time-to-first-byte path
	// and excludes anything still streaming.
	response.headers.set(
		'Server-Timing',
		[
			`auth;desc="session ${cacheHit ? 'cache' : 'db'}";dur=${authMs.toFixed(1)}`,
			`shell;dur=${(performance.now() - requestStart).toFixed(1)}`
		].join(', ')
	);

	return response;
};

const handleWithDeviceDetector = handleDeviecDetector({}, handle);

export { handleWithDeviceDetector as handle };
