export const load = async ({ locals }) => {
	return {
		user: locals.user,
		deviceType: locals.deviceType,
	}
}