import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import { cardReviewSchema } from "$lib/schemas.js";
import { sessionExists } from "$lib/common.util.js";
import { deleteAction, reviewAction } from "$lib/actions/card.action.js";
import { getCardsOrderByNextPractice } from "$lib/db/tables/card.table.js";


export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const reviewForm = superValidate(zod(cardReviewSchema));
	const cards = getCardsOrderByNextPractice(locals.user.id)
	// const groupedInfo = getCardsGroupedByUpdated(locals.user.id)

	return {
		reviewForm,
		cards,
		// groupedInfo
	};
}

export const actions = {
	review: reviewAction(ROUTES.REVISE),
	delete: deleteAction(ROUTES.REVISE)
}


