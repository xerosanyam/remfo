import { ROUTES, sessionExists } from "$project/utils/project.util.js";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
	if (sessionExists(locals)) {
		redirect(302, ROUTES.HOME)
	}
}