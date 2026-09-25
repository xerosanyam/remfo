import { ROUTES } from '$lib/routes.util.js';
import { addAction, deleteAction } from '$lib/actions/card.action.js';

// Mutations for the prerendered /record shell live here, not on the shell itself:
// SvelteKit cannot prerender a page that owns actions, and +server.ts claims the whole
// /api/cards route (a co-located +page.server.ts never sees the POST). The shell posts
// cross-route (/api/card-actions?/add), which form actions support first-class.
export const actions = {
	add: addAction(ROUTES.RECORD),
	delete: deleteAction(ROUTES.RECORD)
};
