import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import type { RequestEvent } from "./$types.js";
import { getCards, insertCard } from "$lib/db/card.util.js";
import { cardAddSchema, cardReviewSchema } from "$lib/schemas.js";


export async function load({ locals }) {
	if (!locals?.user?.id) {
		redirect(302, ROUTES.LOGIN)
	}
	const cards = await getCards(locals.user.id)
	const addForm = await superValidate(zod(cardAddSchema));
	const reviewForm = await superValidate(zod(cardReviewSchema))
	return { addForm, reviewForm, cards };
}

export const actions = {
	add,
	review
}

async function add(event: RequestEvent) {
	try {
		if (!event.locals.user) {
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
			user_id: event.locals.user.id
		});

		redirect(302, ROUTES.HOME);
	} catch (err) {
		console.log('add ~ err:', err);
	}
}

async function review(event: RequestEvent) {
	try {
		if (!event.locals.user) {
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