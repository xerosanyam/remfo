import { building } from '$app/environment';
import { sessionExists } from '$lib/common.util.js';
import { ROUTES } from '$lib/routes.util.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	// /record prerenders its shell: at build time there is no session by definition, and
	// baking the redirect would ship a meta-refresh stub to everyone. Its guard lives
	// client-side (/api/cards 401s into a login redirect) and in /api/card-actions.
	if (!building && !sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN);
	}
}
