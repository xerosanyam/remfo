import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import { cardAddSchema } from "$lib/schemas.js";
import { addAction, deleteAction } from "$lib/actions/card.action.js";
import { getCardsOrderByCreated, getTotalCards } from "$lib/db/tables/card.table.js";

const PAGE_SIZE = 50;
// a hostile ?limit= would put the whole table back on the page, which is the thing we just fixed
const MAX_LIMIT = 500;

export async function load({ locals, url }) {
	const requested = Number(url.searchParams.get('limit')) || PAGE_SIZE;
	const limit = Math.min(Math.max(requested, PAGE_SIZE), MAX_LIMIT);

	const addForm = await superValidate(zod(cardAddSchema));
	// parallel: the count costs no extra round trip
	const [cards, totalCards] = await Promise.all([
		getCardsOrderByCreated(locals.user!.id, limit),
		getTotalCards(locals.user!.id)
	]);

	return {
		addForm,
		cards,
		totalCards,
		limit,
	};
}

export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
}


