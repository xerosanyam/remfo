import { sessionExists } from "$lib/common.util";
import { fail, redirect } from "@sveltejs/kit";
import { ROUTES } from "$lib/routes.util";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { cardAddSchema, cardReviewSchema } from "$lib/schemas";
import { insertCard, reviewCard } from "$lib/db/tables/card.table";
import type { RequestEvent } from "../../routes/(protected)/home/$types";
import type { RequestEvent as RequestEvent2 } from "../../routes/(protected)/learn/$types";

export async function add(event: RequestEvent | RequestEvent2) {
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

export async function review(event: RequestEvent) {
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