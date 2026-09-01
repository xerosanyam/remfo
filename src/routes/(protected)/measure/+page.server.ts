import { getDailyActivity } from '$lib/db/tables/card.table.js';

export async function load({ locals }) {
	const activity = await getDailyActivity(locals.user!.id);

	return {
		reviewedInfo: activity.filter(({ action }) => action === 'UPDATE'),
		recordedInfo: activity.filter(({ action }) => action === 'INSERT')
	};
}
