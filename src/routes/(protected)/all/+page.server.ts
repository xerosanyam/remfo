import { deleteAction } from '$lib/actions/card.action.js';
import { sessionExists } from '$lib/common.util.js';
import { getCards, resetCard } from '$lib/db/tables/card.table.js';
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
	delete: deleteAction(ROUTES.ALL),
	reset: async function ({ locals, request }) {
		const data = await request.formData();
		const id = data.get('id') as string

		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}
		if (!id) {
			return { status: 400, body: { message: 'No id provided' } };
		}
		await resetCard({
			cardId: id,
			userId: locals.user.id,
		});
		redirect(302, ROUTES.HOME);
	}
}