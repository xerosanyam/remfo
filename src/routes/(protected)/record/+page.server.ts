import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";


import { cardAddSchema } from "$lib/schemas.js";
import { addAction, deleteAction } from "$project/actions/card.action.js";
import { ROUTES, sessionExists } from "$project/utils/project.util.js";
import { cardService } from "$lib/modules/card/card.service.js";


export async function load({ locals, setHeaders }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));
	const cards = await cardService.getCardsOrderByCreated(locals.user.id)

	setHeaders({
		'Cache-Control': 'max-age=60'
	});

	return {
		addForm,
		cards
	};
}

export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
}


