import { sessionExists } from '$lib/common.util.js';
import { ROUTES } from '$lib/routes.util.js';
import { cardAddSchema } from '$lib/schemas.js';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));

	return {
		addForm,
	};
}