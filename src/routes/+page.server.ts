import { sessionExists } from '$lib/common.util.js';
import { ROUTES } from '$lib/routes.util.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals, cookies }) {
	if (sessionExists(locals)) {
		redirect(302, ROUTES.HOME);
	}

	// The failure we care about happens on google's domain: some browsers are refused there
	// and told they have javascript disabled when they do not. We never see that, and there is
	// no redirect back. What we can see is the bounce: the callback clears these single-use
	// cookies, so one still being here without a session means a sign-in was started within
	// the last ten minutes and never came back. That is good evidence, not proof, since it
	// also matches someone who simply changed their mind, so it surfaces the code option
	// rather than forcing it.
	return { bouncedFromGoogle: !!cookies.get('google_oauth_state') };
}
