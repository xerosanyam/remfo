import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { ROUTES } from '$lib/routes.util.js';

import { cardAddSchema } from '$lib/schemas.js';
import { addAction, deleteAction } from '$lib/actions/card.action.js';
import { getCardsOrderByCreated, getTotalCards } from '$lib/db/tables/card.table.js';

const PAGE_SIZE = 50;
// a hostile ?limit= would put the whole table back on the page, which is the thing we just fixed
const MAX_LIMIT = 500;

// parallel: the count costs no extra round trip
const loadCards = async (userId: string, limit: number) => {
	const [cards, totalCards] = await Promise.all([
		getCardsOrderByCreated(userId, limit),
		getTotalCards(userId)
	]);
	return { cards, totalCards };
};

export async function load({ locals, url }) {
	const requested = Number(url.searchParams.get('limit')) || PAGE_SIZE;
	const limit = Math.min(Math.max(requested, PAGE_SIZE), MAX_LIMIT);

	// superValidate does no I/O, so awaiting it costs no round trip
	const addForm = await superValidate(zod(cardAddSchema));

	return {
		addForm,
		limit,
		// Awaited, not streamed. A streamed promise is delivered through an inline script,
		// so with no JS the list never arrived at all. Streaming bought a couple of
		// milliseconds once the database stopped being a continent away, which is not worth
		// a card list that only exists for JS clients.
		// The catch keeps what the old {:catch} branch gave us: a failed load degrades to a
		// message beside a working add form, rather than a whole error page.
		cards: await loadCards(locals.user!.id, limit).catch(() => null)
	};
}

export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
};
