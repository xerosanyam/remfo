import { getCardsGroupedByActivityDate } from '$lib/db/tables/card.table.js'

export const load = async ({ locals }) => {
	let groupedInfo
	if (locals.user)
		groupedInfo = await getCardsGroupedByActivityDate(locals.user.id)

	return {
		user: locals.user,
		deviceType: locals.deviceType,
		groupedInfo
	}
}