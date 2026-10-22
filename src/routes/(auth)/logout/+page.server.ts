import { redirect } from '@sveltejs/kit';
import { lucia } from '#lib/server/auth.js';
import { evictSessionCache } from '#lib/server/session-cache.js';

import type { RequestEvent } from './$types';
import { ROUTES } from '#lib/routes.util.js';

const logout = async (event: RequestEvent) => {
	if (!event.locals.session) {
		redirect(302, ROUTES.LOGIN);
	}
	await lucia.invalidateSession(event.locals.session.id);
	evictSessionCache(event.locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	redirect(302, ROUTES.LOGIN);
};

export const load = logout;

export const actions = {
	default: logout
};
