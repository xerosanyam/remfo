export const load = ({ locals }) => {
	return {
		user: locals.user,
		deviceType: locals.deviceType,
	}
}