import { lucia } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { handleDeviecDetector } from 'sveltekit-device-detector';

const sessionAndUserInfo: { [key: string]: App.Locals } = {};

const handle: Handle = async ({ event, resolve }) => {
	console.time('hook.server')
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		console.debug('no session id')
		return resolve(event);
	}
	console.debug('session id exists')

	console.time('validate')
	let { session, user } = sessionAndUserInfo[sessionId] || {}
	if (!session || !user) {
		({ session, user } = await lucia.validateSession(sessionId))
		sessionAndUserInfo[sessionId] = { session, user }

	}
	console.timeEnd('validate')

	//session exists in db & has not expired
	if (session?.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}

	// session doesn't exists in DB
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	console.timeEnd('hook.server')
	return resolve(event);
};

const handleWithDeviceDetector = handleDeviecDetector({}, handle)

export { handleWithDeviceDetector as handle }