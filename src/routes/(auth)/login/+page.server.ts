import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types.js'
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ROUTES } from '$lib/routes.util.js';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});

export async function load() {
	const form = await superValidate(zod(schema));

	return { form };
}

export const actions = {
	default: login
}

async function login(event: RequestEvent) {
	const form = await superValidate(event, zod(schema));
	const { email, password } = form.data
	form.data.password = ''
	if (!form.valid) {
		return fail(400, { form });
	}

	if (email === 'admin@gmail.com' && password === 'admins') {
		redirect(302, ROUTES.HOME)
	}

	return setError(form, 'email', 'Wrong email or password.');
}