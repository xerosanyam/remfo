import type { RequestEvent } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

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
	const form = await superValidate(event, zod(schema));
	if (!form.valid) {
		return fail(400, { form });
	}
	redirect(302, '/add')
}

