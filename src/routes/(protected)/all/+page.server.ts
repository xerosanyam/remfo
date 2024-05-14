import { deleteCard, getCards } from '$lib/db/card.util.js';
import { ROUTES } from '$lib/routes.util.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals?.user?.id) {
		redirect(302, ROUTES.LOGIN)
	}
	const cards = await getCards(locals.user.id)
	return { cards };
}

export const actions = {
	delete: async function (event) {
		const data = await event.request.formData();
		const id = data.get('id') as string

		try {
			if (!event.locals.user) {
				redirect(302, ROUTES.LOGIN);
			}
			console.log('id:', id)
			if (!id) {
				return { status: 400, body: { message: 'No id provided' } };
			}
			await deleteCard({
				user_id: event.locals.user.id,
				card_id: id
			});
			redirect(302, ROUTES.HOME);
		} catch (err) {
			console.log('delete ~ err:', err);
		}
	}
}