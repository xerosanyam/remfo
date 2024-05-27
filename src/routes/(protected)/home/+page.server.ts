import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { ROUTES } from "$lib/routes.util.js";

import type { RequestEvent } from "./$types.js";
import { getCard, getTotalCards, insertCard, reviewCard } from "$lib/db/tables/card.table.js";
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
		card: await getCard(locals.user.id),
		totalCards: await getTotalCards(locals.user.id)
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
			userId: locals.user.id
		});

		redirect(302, ROUTES.HOME);
	} catch (err) {
		console.error('add ~ err:', err);
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
		await reviewCard({ cardId: form.data.cardId, userId: locals.user.id, difficulty: form.data.difficulty })

		redirect(302, ROUTES.HOME);
	} catch (err) {
		console.error('add ~ err:', err);
	}
}