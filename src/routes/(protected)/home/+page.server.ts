import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

import { ROUTES } from "$lib/routes.util.js";

import type { RequestEvent } from "./$types.js";
import { insertCard } from "$lib/db/card.util.js";

const schema = z.object({
	front: z.string().min(1).max(140),
	back: z.string().min(1).max(140)
});

export async function load() {
	const form = await superValidate(zod(schema));

	return { form };
}

export const actions = {
	default: add
}

async function add(event: RequestEvent) {
	try {
		if (!event.locals.user) {
			redirect(302, ROUTES.LOGIN);
		}

		const form = await superValidate(event, zod(schema));
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
