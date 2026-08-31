import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import { cardAddSchema } from "$lib/schemas.js";
import { addAction, deleteAction } from "$lib/actions/card.action.js";
import { getCardsOrderByCreated, getTotalCards } from "$lib/db/tables/card.table.js";

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
}

export async function load({ locals, url }) {
	const requested = Number(url.searchParams.get('limit')) || PAGE_SIZE;
	const limit = Math.min(Math.max(requested, PAGE_SIZE), MAX_LIMIT);

	// superValidate does no I/O, so awaiting it costs no round trip
	const addForm = await superValidate(zod(cardAddSchema));

	return {
		addForm,
		limit,
		// streamed, not awaited: the shell and the add-card form render one round trip
		// earlier, while the card list is still in flight
		cards: loadCards(locals.user!.id, limit),
	};
}

export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
}
