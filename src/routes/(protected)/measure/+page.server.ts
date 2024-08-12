import { getCardsRecorded, getCardsReviewed } from '$lib/db/tables/card.table.js';

export async function load({ locals }) {
	const reviewedInfo = getCardsReviewed(locals.user!.id)
	const recordedInfo = getCardsRecorded(locals.user!.id)
	
	return {
		reviewedInfo,
		recordedInfo
	};
}