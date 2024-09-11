import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import { cardAddSchema } from "$lib/schemas.js";
import { sessionExists } from "$lib/common.util.js";
import { addAction, deleteAction } from "$project/actions/card.action.js";
import { getCardsOrderByCreated } from "$lib/db/tables/card.table.js";


export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));
	const cards = await getCardsOrderByCreated(locals.user.id)

	return {
		addForm,
		cards
	};
}

export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
}


