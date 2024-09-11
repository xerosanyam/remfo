import { sessionExists } from '$lib/common.util.js';
import { ROUTES } from '$lib/routes.util.js';
import { cardAddSchema, cardLearnSchema } from '$lib/schemas.js';
import { generateCardUsingOpenAI } from '$lib/services/openai.service.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { RequestEvent } from './$types.js';
import { addAction } from '$project/actions/card.action.js';

export async function load({ locals }) {
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN)
	}

	const addForm = await superValidate(zod(cardAddSchema));

	const learnForm = await superValidate(zod(cardLearnSchema));

	return {
		addForm,
		learnForm,
	};
}

const generateCard = async (event: RequestEvent) => {
	const { locals } = event
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN);
	}

	const form = await superValidate(event, zod(cardLearnSchema));
	if (!form.valid) {
		return fail(400, { form });
	}

	console.log('generateCard ~ form:', form)

	const { cards, error } = await generateCardUsingOpenAI({
		userInput: form.data.userInput
	});

	return { data: cards, error: error, userInput: form.data.userInput }
}

export const actions = {
	generateCard,
	add: addAction(ROUTES.LEARN),
}