import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/routes.util.js';

import { sessionExists } from '$lib/common.util.js';
import { deleteAction, reviewAction } from '$lib/actions/card.action.js';
import { getCardsOrderByNextPractice } from '$lib/db/tables/card.table.js';

export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN);
	}

	const cards = await getCardsOrderByNextPractice(locals.user.id);

	return { cards };
}

export const actions = {
	review: reviewAction(ROUTES.REVISE),
	delete: deleteAction(ROUTES.REVISE)
};
