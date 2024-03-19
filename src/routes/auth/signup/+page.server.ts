import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from './$types.js'

export const actions = {
	default: signup
}

async function signup(event: RequestEvent) {
	const { request } = event
	const formData = await request.formData()
	const email = formData.get('email')

	if (!email) {
		return fail(400, { email, missing: true });
	}

	// check for both user exists and email is verified
	if (email === 'admin@gmail.com') {
		return redirect(307, '/auth/login')
	}

	return { text: 'signed up' }
}
