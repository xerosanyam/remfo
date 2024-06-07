import { sessionExists } from "$lib/common.util";
import { fail, redirect } from "@sveltejs/kit";
import { ROUTES } from "$lib/routes.util";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { cardAddSchema, cardReviewSchema } from "$lib/schemas";
import { deleteCard, insertCard, reviewCard } from "$lib/db/tables/card.table";
import type { RequestEvent as R2 } from "../../routes/(protected)/learn/$types";
import type { RequestEvent as RecordType } from "../../routes/(protected)/record/$types";
import type { RequestEvent as R5 } from "../../routes/(protected)/revise/$types";

export function addAction(location: string) {
	return async (event: R2 | RecordType) => {
		const { locals } = event
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

		redirect(302, location);
	}
}

export function reviewAction(location: string) {
	return async (event: R5) => {
		const { locals } = event
		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}

		const form = await superValidate(event, zod(cardReviewSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		await reviewCard({ cardId: form.data.cardId, userId: locals.user.id, difficulty: form.data.difficulty })

		redirect(302, location);
	}
}

export function deleteAction(location: string) {
	return async ({ locals, request }: RecordType | R5) => {
		const data = await request.formData();
		const id = data.get('id') as string

		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}
		if (!id) {
			return fail(400, { message: 'No cardId provided' })
		}
		await deleteCard({
			cardId: id,
			userId: locals.user.id,
		});
		redirect(302, location);
	}
}