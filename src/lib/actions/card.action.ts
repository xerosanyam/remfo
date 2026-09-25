import { sessionExists } from '$lib/common.util';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { ROUTES } from '$lib/routes.util';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { cardAddSchema, cardReviewSchema } from '$lib/schemas';
import { deleteCard, insertCard, reviewCard } from '$lib/db/tables/card.table';
import type { RequestEvent as R5 } from '../../routes/(protected)/revise/$types';

// RequestEvent, not a union of per-route types: these factories serve actions on several
// routes, including cross-route targets like /api/cards that own no page of their own.
export function addAction(location: string) {
	return async (event: RequestEvent) => {
		const { locals } = event;
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
	};
}

export function reviewAction(location: string) {
	return async (event: R5) => {
		const { locals } = event;
		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}

		const form = await superValidate(event, zod(cardReviewSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const reviewed = await reviewCard({
			cardId: form.data.cardId,
			userId: locals.user.id,
			difficulty: form.data.difficulty
		});
		// 404 rather than 403: the card either does not exist or is not this user's, and saying
		// which would confirm the existence of someone else's card.
		if (!reviewed) {
			return fail(404, { form });
		}

		redirect(302, location);
	};
}

export function deleteAction(location: string) {
	return async ({ locals, request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('cardId') as string;

		if (!sessionExists(locals)) {
			redirect(302, ROUTES.LOGIN);
		}
		if (!id) {
			return fail(400, { message: 'No cardId provided' });
		}
		await deleteCard({
			cardId: id,
			userId: locals.user.id
		});
		redirect(302, location);
	};
}
