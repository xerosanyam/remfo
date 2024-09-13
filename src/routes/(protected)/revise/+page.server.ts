import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";


import { cardReviewSchema } from "$lib/schemas.js";
import { deleteAction, reviewAction } from "$project/actions/card.action.js";
import { ROUTES, sessionExists } from "$project/utils/project.util.js";
import { cardService } from "$lib/modules/card/card.service.js";


export async function load({ locals, setHeaders }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const reviewForm = superValidate(zod(cardReviewSchema));
	const cards = cardService.getCardsOrderByNextPractice(locals.user.id)
	setHeaders({
		'Cache-Control': 'max-age=60'
	});

	return {
		reviewForm,
		cards
	};
}

export const actions = {
	review: reviewAction(ROUTES.REVISE),
	delete: deleteAction(ROUTES.REVISE)
}


