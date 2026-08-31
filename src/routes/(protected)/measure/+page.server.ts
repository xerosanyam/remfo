import { getDailyActivity } from '$lib/db/tables/card.table.js';

export async function load({ locals }) {
	const activity = getDailyActivity(locals.user!.id);

	return {
		reviewedInfo: activity.then((rows) => rows.filter(({ action }) => action === 'UPDATE')),
		recordedInfo: activity.then((rows) => rows.filter(({ action }) => action === 'INSERT'))
	};
}
