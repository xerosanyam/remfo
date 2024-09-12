import { redirect } from "@sveltejs/kit";

import type { RequestEvent } from "./$types";
import { lucia } from "$lib/modules/auth/auth.service";
import { ROUTES } from "$project/utils/project.util";

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