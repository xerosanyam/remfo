import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { cardAddSchema } from '$lib/schemas.js';

export async function load() {
	// Prerendered shell: nothing user-specific here. superValidate does no I/O, so the
	// form skeleton bakes into CDN HTML. Auth guard and list live client-side (/api/cards
	// 401s logged-out visitors into a login redirect); mutations moved to POST /api/cards
	// because pages with actions cannot prerender. Form posts still guard server-side.
	return { addForm: await superValidate(zod(cardAddSchema)) };
}
