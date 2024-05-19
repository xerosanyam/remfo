import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import type { RequestEvent } from "./$types.js";
import { getCards, insertCard } from "$lib/db/card.util.js";
import { cardAddSchema, cardReviewSchema } from "$lib/schemas.js";
import { sessionExists } from "$lib/common.util.js";


export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));
	const reviewForm = await superValidate(zod(cardReviewSchema))

	return {
		addForm,
		reviewForm,
		cards: await getCards(locals.user.id)
	};
}

export const actions = {
	add,
	review
}

async function add(event: RequestEvent) {
	const { locals } = event
	try {
		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}

		const form = await superValidate(event, zod(cardAddSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		await insertCard({
			id: crypto.randomUUID(),
			front: form.data.front,
			back: form.data.back,
			user_id: locals.user.id
		});

		redirect(302, ROUTES.HOME);
	} catch (err) {
		console.log('add ~ err:', err);
	}
}

async function review(event: RequestEvent) {
	const { locals } = event
	try {
		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}

		const form = await superValidate(event, zod(cardReviewSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		redirect(302, ROUTES.HOME);
	} catch (err) {
		console.log('add ~ err:', err);
	}
}