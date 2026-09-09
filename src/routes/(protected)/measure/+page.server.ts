import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/routes.util.js';
import { sessionExists } from '$lib/common.util.js';
import { getDailyActivity } from '$lib/db/tables/card.table.js';

export async function load({ locals }) {
	// The (protected) layout guard runs in parallel with page loads, not before them, so this
	// cannot lean on it having already redirected.
	if (!sessionExists(locals)) {
		redirect(302, ROUTES.LOGIN);
	}

	const activity = await getDailyActivity(locals.user.id);

	return {
		reviewedInfo: activity.filter(({ action }) => action === 'UPDATE'),
		recordedInfo: activity.filter(({ action }) => action === 'INSERT')
	};
}
