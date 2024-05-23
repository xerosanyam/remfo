import { sessionExists } from '$lib/common.util.js';
import { deleteCard, getCards } from '$lib/db/tables/card.table.js';
import { ROUTES } from '$lib/routes.util.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}
	const cards = await getCards(locals.user.id)
	return { cards };
}

export const actions = {
	delete: async function ({ locals, request }) {
		const data = await request.formData();
		const id = data.get('id') as string

		try {
			if (!sessionExists(locals)) {
				redirect(302, ROUTES.LOGIN);
			}
			if (!id) {
				return { status: 400, body: { message: 'No id provided' } };
			}
			await deleteCard({
				cardId: id,
				userId: locals.user.id,
			});
			redirect(302, ROUTES.HOME);
		} catch (err) {
			console.error('delete ~ err:', err);
		}
	}
}