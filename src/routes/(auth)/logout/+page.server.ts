import { redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";

import type { RequestEvent } from "./$types";
import { ROUTES } from "$lib/routes.util";

const logout = async (event: RequestEvent) => {
	if (!event.locals.session) {
		redirect(302, ROUTES.LOGIN);
	}
	await lucia.invalidateSession(event.locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: ".",
		...sessionCookie.attributes
	});
	redirect(302, ROUTES.LOGIN);
}

export const load = logout

export const actions = {
	default: logout
}