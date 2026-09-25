import { error, json } from '@sveltejs/kit';

import { clampCardLimit, sessionExists } from '$lib/common.util.js';
import { getCardsOrderByCreated, getTotalCards } from '$lib/db/tables/card.table.js';

// List island for the prerendered /record shell: per-user data can never bake into CDN
// HTML, so the shell fetches it client-side. no-store: a cached list served post-logout
// (or vice versa) would show another session's cards.
export async function GET({ locals, url }) {
	if (!sessionExists(locals)) error(401, 'not signed in');

	const limit = clampCardLimit(Number(url.searchParams.get('limit')));
	// parallel: the count costs no extra round trip
	const [cards, totalCards] = await Promise.all([
		getCardsOrderByCreated(locals.user.id, limit),
		getTotalCards(locals.user.id)
	]);
	return json({ cards, totalCards }, { headers: { 'Cache-Control': 'no-store' } });
}
