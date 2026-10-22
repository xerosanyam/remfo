import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { cardAddSchema } from '$lib/schemas.js';

export async function load() {
	// Prerender the shell; the card list loads client-side (/api/cards 401s logged-out
	// visitors into a login redirect). Mutations use POST /api/cards because pages with
	// actions cannot prerender.
	return { addForm: await superValidate(zod(cardAddSchema)) };
}
