import { sessionExists } from "$lib/common.util.js";
import { ROUTES } from "$lib/routes.util.js";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
	console.log('protected')
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}
}