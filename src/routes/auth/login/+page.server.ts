import { fail } from '@sveltejs/kit'
import type { RequestEvent } from './$types.js'

export const actions = {
	default: login
}

async function login(event: RequestEvent) {
	const { request } = event
	const formData = await request.formData()
	const email = formData.get('email')
	const password = formData.get('password')

	if (!email) {
		return fail(400, { email, missing: true });
	}
	if (!password) {
		return fail(400, { email, missing_password: true });
	}

	if (email === 'admin@gmail.com' && password === 'admin') {
		return { text: 'logged in' }
	} else {
		console.error('Incorrect email or password', { email, password })
		return fail(400, { email, incorrect: true })
	}
}