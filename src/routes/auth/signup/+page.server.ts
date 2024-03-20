import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types.js'
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from "zod";

const schema = z.object({
	email: z.string().email()
});

export async function load() {
	const form = await superValidate(zod(schema));

	return { form };
}

export const actions = {
	default: signup
}

async function signup(event: RequestEvent) {
	const form = await superValidate(event, zod(schema));

	if (!form.valid) {
		return fail(400, { form });
	}

	// check for both user exists and email is verified
	if (form.data.email === 'admin@gmail.com') {
		return redirect(307, '/auth/login')
	}

	return message(form, 'Success. Please check email.')
}
