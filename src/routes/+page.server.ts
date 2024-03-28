import { ROUTES } from "$lib/routes.util.js";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
	if (locals.user) {
		redirect(302, ROUTES.HOME)
	}
}