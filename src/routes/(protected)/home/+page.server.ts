import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import { getCard, getTotalCards } from "$lib/db/tables/card.table.js";
import { cardAddSchema, cardReviewSchema } from "$lib/schemas.js";
import { sessionExists } from "$lib/common.util.js";
import { add, review } from "$lib/actions/card.action.js";


export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));
	const reviewForm = await superValidate(zod(cardReviewSchema))

	return {
		addForm,
		reviewForm,
		card: await getCard(locals.user.id),
		totalCards: await getTotalCards(locals.user.id)
	};
}

export const actions = {
	add,
	review
}

